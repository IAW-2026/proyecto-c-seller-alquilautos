import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { fmtDate, daysBetween } from "@/lib/utils";
import Link from "next/link";
import { ReservasFilterBar } from "@/components/features/admin/ReservasFilterBar";
import { ExportButtons } from "@/components/features/admin/ExportButtons";
import { exportarReservasAction } from "@/lib/actions/admin.actions";
import { EstadoReserva, Prisma } from "@prisma/client";
import { CancelarReservaButton } from "@/components/features/admin/CancelarReservaButton";

const ESTADOS_TERMINALES: EstadoReserva[] = ["Cancelada", "Rechazada", "Finalizada"];

const PAGE_SIZE = 8;
const thClass   = "text-left text-[11px] font-semibold tracking-[0.04em] uppercase text-[var(--text-tertiary)] px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-page)]";
const tdClass   = "px-4 py-[14px] border-b border-[var(--border-default)] text-[13px] align-middle";
const linkBtnSmClass = "inline-flex items-center justify-center px-[10px] py-[6px] rounded-[var(--radius-md)] text-[12px] font-semibold bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-[background] duration-[180ms]";

export default async function AdminReservasPage({
  searchParams,
}: {
  searchParams: Promise<{
    estado?: string;
    propietario?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    alquilador?: string;
    page?: string;
  }>;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  if (role !== "adminSeller") redirect("/dashboard");

  const {
    estado = "Todos",
    propietario = "",
    fechaDesde = "",
    fechaHasta = "",
    alquilador = "",
    page: pageParam = "1",
  } = await searchParams;
  const page = parseInt(pageParam, 10);

  const where: Prisma.ReservaWhereInput = {
    ...(estado !== "Todos" && { estado: estado as EstadoReserva }),
    ...(propietario && { id_propietario: propietario }),
    ...(alquilador && { id_alquilador: { contains: alquilador, mode: "insensitive" } }),
    ...((fechaDesde || fechaHasta) && {
      fecha_inicio: {
        ...(fechaDesde && { gte: new Date(fechaDesde) }),
        ...(fechaHasta && { lte: new Date(`${fechaHasta}T23:59:59.999`) }),
      },
    }),
  };

  const [reservas, total, propietarios] = await Promise.all([
    db.reserva.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: { vehiculo: true, propietario: true },
    }),
    db.reserva.count({ where }),
    db.propietario.findMany({
      select: { id_propietario: true, nombre: true, apellido: true },
      orderBy: { nombre: "asc" },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const filterParams = new URLSearchParams();
  if (estado !== "Todos") filterParams.set("estado", estado);
  if (propietario) filterParams.set("propietario", propietario);
  if (fechaDesde) filterParams.set("fechaDesde", fechaDesde);
  if (fechaHasta) filterParams.set("fechaHasta", fechaHasta);
  if (alquilador) filterParams.set("alquilador", alquilador);
  const filtrosQuery = filterParams.toString();
  const hasFiltrosActivos = filtrosQuery.length > 0;

  return (
    <div>
      {/* Page header */}
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap max-[900px]:flex-col max-[900px]:items-start">
        <div>
          <h2 className="m-0 text-[22px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">Reservas</h2>
          <div className="text-[13px] text-[var(--text-secondary)] mt-1">{total} registro{total === 1 ? "" : "s"} en total</div>
        </div>
        <div className="flex items-end gap-3 flex-wrap">
          <ReservasFilterBar
            estadoActual={estado}
            propietarioActual={propietario}
            fechaDesde={fechaDesde}
            fechaHasta={fechaHasta}
            alquiladorActual={alquilador}
            propietarios={propietarios}
          />
          <ExportButtons
            action={exportarReservasAction}
            params={{ estado, propietario, fechaDesde, fechaHasta, alquilador }}
            filename="reservas"
            title="Reservas"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)]">
        {reservas.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="Sin reservas"
            message={hasFiltrosActivos ? "No hay reservas que coincidan con los filtros aplicados." : "No hay reservas registradas."}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse max-[900px]:min-w-[700px]">
                <thead>
                  <tr>
                    {["ID Alquilador", "Vehículo", "Propietario", "Fechas", "Días", "Estado", ""].map(h => (
                      <th key={h} className={thClass}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reservas.map(r => (
                    <tr key={r.id_reserva} className="hover:[&>td]:bg-[color-mix(in_srgb,var(--color-primary-400)_4%,transparent)]">
                      <td className={tdClass}>{r.id_alquilador}</td>
                      <td className={tdClass}>{r.vehiculo.marca} {r.vehiculo.modelo}</td>
                      <td className={tdClass}>{r.propietario.nombre} {r.propietario.apellido}</td>
                      <td className={tdClass}>{fmtDate(r.fecha_inicio)} → {fmtDate(r.fecha_final)}</td>
                      <td className={tdClass}>{daysBetween(r.fecha_inicio, r.fecha_final)}</td>
                      <td className={tdClass}><StatusBadge estado={r.estado} /></td>
                      <td className={tdClass}>
                        <div className="flex justify-end">
                          {!ESTADOS_TERMINALES.includes(r.estado) && (
                            <CancelarReservaButton id_reserva={r.id_reserva} />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-default)] text-[12px] text-[var(--text-secondary)] bg-[var(--bg-page)]">
                <span>Página {page} de {totalPages}</span>
                <div className="flex gap-2">
                  {page > 1          && <Link href={`?${filtrosQuery}${filtrosQuery ? "&" : ""}page=${page - 1}`} className={linkBtnSmClass}>Anterior</Link>}
                  {page < totalPages && <Link href={`?${filtrosQuery}${filtrosQuery ? "&" : ""}page=${page + 1}`} className={linkBtnSmClass}>Siguiente</Link>}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
