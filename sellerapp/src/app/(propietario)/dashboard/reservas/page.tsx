import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getReservasByPropietario } from "@/lib/services/reserva.service";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { fmtDate, daysBetween } from "@/lib/utils";
import { getAlquilador } from "@/lib/mocks/buyerApp";
import ReservasActions from "@/components/features/reservas/ReservasAction";
import Link from "next/link";
import { ReservaDetalleModal } from "@/components/features/reservas/ReservaDetalleModal";
import { getVehiculo } from "@/lib/services/vehiculo.service";
import { getHorarioSeleccionado } from "@/lib/mocks/shippingApp";
import { ResenasModal } from "@/components/features/reservas/ResenasModal";
import { EstadoFiltro } from "@/components/features/reservas/EstadoFiltro";

const ESTADOS = ["Todos", "Pendiente", "Aceptada", "Rechazada", "Coordinada", "Pagada", "Entregada", "Finalizada", "Cancelada"];
const PAGE_SIZE = 8;

export default async function ReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; page?: string }>;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const id_propietario = (sessionClaims?.publicMetadata as { id_propietario?: string })?.id_propietario;
  if (!id_propietario) redirect("/onboarding");

  const { estado = "Todos", page: pageParam = "1" } = await searchParams;
  const page = parseInt(pageParam, 10);

  const result = await getReservasByPropietario(id_propietario);
  const todas = result.data?.reservas ?? [];
  const filtered = estado === "Todos" ? todas : todas.filter(r => r.estado === estado);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const alquiladoresMap: Record<string, Awaited<ReturnType<typeof getAlquilador>>> = {};
  await Promise.all(
    pageItems.map(async r => {
      alquiladoresMap[r.id_alquilador] = await getAlquilador(r.id_alquilador);
    })
  );

  const estadosConHorario = ["Coordinada", "Pagada", "Finalizada", "Entregada"];

const vehiculosMap: Record<string, { id_vehiculo: string; marca: string; modelo: string; precio: number }> = {};
await Promise.all(
  pageItems.map(async r => {
    const result = await getVehiculo(r.id_vehiculo);
    if (result.data) {
      vehiculosMap[r.id_vehiculo] = result.data;
    }
  })
);

const horariosMap: Record<string, {
  hora_inicio_entrega: string;
  hora_fin_entrega: string;
  hora_inicio_devolucion: string;
  hora_fin_devolucion: string;
} | null> = {};

await Promise.all(
  pageItems.map(async r => {
    if (estadosConHorario.includes(r.estado)) {
      horariosMap[r.id_reserva] = await getHorarioSeleccionado(r.id_reserva);
    } else {
      horariosMap[r.id_reserva] = null;
    }
  })
);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Reservas</h2>
          <div className="sub">Gestioná las reservas de todos tus vehículos.</div>
        </div>
        <EstadoFiltro estadoActual={estado} />
      </div>

      <div className="table-wrap">
        {pageItems.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="Sin reservas"
            message={estado !== "Todos" ? `No tenés reservas en estado "${estado}".` : "Todavía no hay reservas para tus vehículos."}
          />
        ) : (
          <table className="data">
            <thead>
              <tr>
                <th>Alquilador</th>
                <th>Vehículo</th>
                <th>Fechas</th>
                <th>Días</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map(r => {
                const al = alquiladoresMap[r.id_alquilador];
                const dias = daysBetween(r.fecha_inicio, r.fecha_final);
                return (
                  <tr key={r.id_reserva}>
                    <td>
                      <div className="cell-user">
                        <div>
                          <div className="name">{al ? `${al.nombre} ${al.apellido}` : r.id_alquilador}</div>
                          <div className="sub">{al?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {vehiculosMap[r.id_vehiculo]
                        ? `${vehiculosMap[r.id_vehiculo].marca} ${vehiculosMap[r.id_vehiculo].modelo}`
                        : r.id_vehiculo}
                    </td>
                    <td>{fmtDate(r.fecha_inicio)} → {fmtDate(r.fecha_final)}</td>
                    <td>{dias}</td>
                    <td><StatusBadge estado={r.estado} /></td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
                        {r.estado === "Pendiente" && (
                          <ReservasActions
                            reserva={r}
                            monto_pagar={Number(vehiculosMap[r.id_vehiculo]?.precio ?? 0) * daysBetween(r.fecha_inicio, r.fecha_final)}
                          />
                        )}
                        {r.estado === "Finalizada" && (
                          <ResenasModal
                            reserva={r}
                            alquilador={alquiladoresMap[r.id_alquilador]}
                            id_propietario={id_propietario}
                          />
                        )}
                        <ReservaDetalleModal
                          reserva={r}
                          alquilador={alquiladoresMap[r.id_alquilador]}
                          vehiculo={vehiculosMap[r.id_vehiculo]}
                          horario={horariosMap[r.id_reserva]}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {totalPages > 1 && (
          <div className="pagination">
            <span>Página {page} de {totalPages}</span>
            <div className="pages">
              {page > 1 && (
                <Link href={`?estado=${estado}&page=${page - 1}`} className="btn secondary sm">Anterior</Link>
              )}
              {page < totalPages && (
                <Link href={`?estado=${estado}&page=${page + 1}`} className="btn secondary sm">Siguiente</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}