import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { fmtDate, daysBetween } from "@/lib/utils";
import Link from "next/link";

const ESTADOS = ["Todos", "Pendiente", "Aceptada", "Rechazada"];
const PAGE_SIZE = 8;

export default async function AdminReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; page?: string }>;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  if (role !== "adminSeller") redirect("/dashboard");

  const { estado = "Todos", page: pageParam = "1" } = await searchParams;
  const page = parseInt(pageParam, 10);

  const where = estado !== "Todos" ? { estado: estado as "Pendiente" | "Aceptada" | "Rechazada" } : {};

  const [reservas, total] = await Promise.all([
    db.reserva.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        vehiculo: true,
        propietario: true,
      },
    }),
    db.reserva.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Reservas</h2>
          <div className="sub">{total} registro{total === 1 ? "" : "s"} en total</div>
        </div>
        <div className="tabs" role="tablist">
          {ESTADOS.map(e => (
            <Link
              key={e}
              href={`?estado=${e}&page=1`}
              className={estado === e || (e === "Todos" && !estado) ? "active" : ""}
              role="tab"
            >
              {e}
            </Link>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        {reservas.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="Sin reservas"
            message={estado !== "Todos" ? `No hay reservas en estado "${estado}".` : "No hay reservas registradas."}
          />
        ) : (
          <>
            <table className="data">
              <thead>
                <tr>
                  <th>ID Alquilador</th>
                  <th>Vehículo</th>
                  <th>Propietario</th>
                  <th>Fechas</th>
                  <th>Días</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map(r => (
                  <tr key={r.id_reserva}>
                    <td>{r.id_alquilador}</td>
                    <td>{r.vehiculo.marca} {r.vehiculo.modelo}</td>
                    <td>{r.propietario.nombre} {r.propietario.apellido}</td>
                    <td>{fmtDate(r.fecha_inicio)} → {fmtDate(r.fecha_final)}</td>
                    <td>{daysBetween(r.fecha_inicio, r.fecha_final)}</td>
                    <td><StatusBadge estado={r.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          </>
        )}
      </div>
    </div>
  );
}