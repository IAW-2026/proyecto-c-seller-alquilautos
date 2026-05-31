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

const PAGE_SIZE = 8;

const linkBtnSmClass = "inline-flex items-center justify-center px-[10px] py-[6px] rounded-[var(--radius-md)] text-[12px] font-semibold bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-[background] duration-[180ms]";

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

  const result   = await getReservasByPropietario(id_propietario);
  const todas    = result.data?.reservas ?? [];
  const filtered = estado === "Todos" ? todas : todas.filter(r => r.estado === estado);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const alquiladoresMap: Record<string, Awaited<ReturnType<typeof getAlquilador>>> = {};
  await Promise.all(pageItems.map(async r => {
    alquiladoresMap[r.id_alquilador] = await getAlquilador(r.id_alquilador);
  }));

  const estadosConHorario = ["Coordinada", "Pagada", "Finalizada", "Entregada"];

  const vehiculosMap: Record<string, { id_vehiculo: string; marca: string; modelo: string; precio: number }> = {};
  await Promise.all(pageItems.map(async r => {
    const res = await getVehiculo(r.id_vehiculo);
    if (res.data) vehiculosMap[r.id_vehiculo] = res.data;
  }));

  const horariosMap: Record<string, { hora_inicio_entrega: string; hora_fin_entrega: string; hora_inicio_devolucion: string; hora_fin_devolucion: string; } | null> = {};
  await Promise.all(pageItems.map(async r => {
    horariosMap[r.id_reserva] = estadosConHorario.includes(r.estado)
      ? await getHorarioSeleccionado(r.id_reserva)
      : null;
  }));

  return (
    <div>
      {/* Page header */}
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap max-[900px]:flex-col max-[900px]:items-start">
        <div>
          <h2 className="m-0 text-[22px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">Reservas</h2>
          <div className="text-[13px] text-[var(--text-secondary)] mt-1">Gestioná las reservas de todos tus vehículos.</div>
        </div>
        <EstadoFiltro estadoActual={estado} />
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)]">
        {pageItems.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="Sin reservas"
            message={estado !== "Todos"
              ? `No tenés reservas en estado "${estado}".`
              : "Todavía no hay reservas para tus vehículos."}
          />
        ) : (
          <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
            <table className="w-full border-collapse max-[900px]:min-w-[700px]">
              <thead>
                <tr>
                  {["Alquilador", "Vehículo", "Fechas", "Días", "Estado", ""].map((h, i) => (
                    <th
                      key={i}
                      className="text-left text-[11px] font-semibold tracking-[0.04em] uppercase text-[var(--text-tertiary)] px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-page)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageItems.map(r => {
                  const al   = alquiladoresMap[r.id_alquilador];
                  const dias = daysBetween(r.fecha_inicio, r.fecha_final);
                  return (
                    <tr key={r.id_reserva} className="hover:[&>td]:bg-[color-mix(in_srgb,var(--color-primary-400)_4%,transparent)]">
                      <td className="px-4 py-[14px] border-b border-[var(--border-default)] text-[13px] align-middle last:border-b-0">
                        <div className="flex items-center gap-[10px]">
                          <div>
                            <div className="font-semibold text-[var(--text-primary)]">
                              {al ? `${al.nombre} ${al.apellido}` : r.id_alquilador}
                            </div>
                            <div className="text-[11px] text-[var(--text-secondary)]">{al?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-[14px] border-b border-[var(--border-default)] text-[13px] align-middle">
                        {vehiculosMap[r.id_vehiculo]
                          ? `${vehiculosMap[r.id_vehiculo].marca} ${vehiculosMap[r.id_vehiculo].modelo}`
                          : r.id_vehiculo}
                      </td>
                      <td className="px-4 py-[14px] border-b border-[var(--border-default)] text-[13px] align-middle">
                        {fmtDate(r.fecha_inicio)} → {fmtDate(r.fecha_final)}
                      </td>
                      <td className="px-4 py-[14px] border-b border-[var(--border-default)] text-[13px] align-middle">
                        {dias}
                      </td>
                      <td className="px-4 py-[14px] border-b border-[var(--border-default)] text-[13px] align-middle">
                        <StatusBadge estado={r.estado} />
                      </td>
                      <td className="px-4 py-[14px] border-b border-[var(--border-default)] text-[13px] align-middle text-right">
                        <div className="flex gap-2 justify-end items-center">
                          {r.estado === "Pendiente" && (
                            <ReservasActions
                              reserva={r}
                              monto_pagar={Number(vehiculosMap[r.id_vehiculo]?.precio ?? 0) * dias}
                              vehiculo={vehiculosMap[r.id_vehiculo]}
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
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-default)] text-[12px] text-[var(--text-secondary)] bg-[var(--bg-page)]">
            <span>Página {page} de {totalPages}</span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`?estado=${estado}&page=${page - 1}`} className={linkBtnSmClass}>Anterior</Link>
              )}
              {page < totalPages && (
                <Link href={`?estado=${estado}&page=${page + 1}`} className={linkBtnSmClass}>Siguiente</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}