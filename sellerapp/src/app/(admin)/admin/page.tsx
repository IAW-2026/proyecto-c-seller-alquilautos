import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/ui/Badge";
import { fmtDate } from "@/lib/utils";

const thClass = "text-left text-[11px] font-semibold tracking-[0.04em] uppercase text-[var(--text-tertiary)] px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-page)]";
const tdClass = "px-4 py-[14px] border-b border-[var(--border-default)] text-[13px] align-middle last:border-b-0";
const kpiClass = "bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] px-5 py-[18px] shadow-[var(--shadow-sm)]";

export default async function AdminDashboardPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  if (role !== "adminSeller") redirect("/dashboard");

  const [propietarios, vehiculos, reservas] = await Promise.all([
    db.propietario.count(),
    db.vehiculo.count(),
    db.reserva.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const pendientes    = await db.reserva.count({ where: { estado: "Pendiente" } });
  const aceptadas     = await db.reserva.count({ where: { estado: "Aceptada"  } });
  const rechazadas    = await db.reserva.count({ where: { estado: "Rechazada" } });
  const totalReservas = pendientes + aceptadas + rechazadas;

  return (
    <div>
      {/* Page header */}
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap max-[900px]:flex-col max-[900px]:items-start">
        <div>
          <h2 className="m-0 text-[22px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">Resumen de la plataforma</h2>
          <div className="text-[13px] text-[var(--text-secondary)] mt-1">Indicadores globales de AlquilAutos</div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-[14px] mb-7" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <div className={kpiClass}>
          <div className="text-[12px] text-[var(--text-secondary)]">Propietarios</div>
          <div className="text-[26px] font-bold tracking-[-0.01em] mt-1">{propietarios}</div>
        </div>
        <div className={kpiClass}>
          <div className="text-[12px] text-[var(--text-secondary)]">Vehículos publicados</div>
          <div className="text-[26px] font-bold tracking-[-0.01em] mt-1">{vehiculos}</div>
        </div>
        <div className={kpiClass}>
          <div className="text-[12px] text-[var(--text-secondary)]">Reservas totales</div>
          <div className="text-[26px] font-bold tracking-[-0.01em] mt-1">{totalReservas}</div>
        </div>
        <div className={kpiClass}>
          <div className="text-[12px] text-[var(--text-secondary)]">Pendientes</div>
          <div className="text-[26px] font-bold tracking-[-0.01em] mt-1">{pendientes}</div>
          <div className="text-[12px] text-[var(--color-success-500)] mt-1">Requieren acción</div>
        </div>
        <div className={kpiClass}>
          <div className="text-[12px] text-[var(--text-secondary)]">Aceptadas</div>
          <div className="text-[26px] font-bold tracking-[-0.01em] mt-1">{aceptadas}</div>
          <div className="text-[12px] text-[var(--color-success-500)] mt-1">
            {totalReservas > 0 ? Math.round(aceptadas / totalReservas * 100) : 0}% tasa
          </div>
        </div>
        <div className={kpiClass}>
          <div className="text-[12px] text-[var(--text-secondary)]">Rechazadas</div>
          <div className="text-[26px] font-bold tracking-[-0.01em] mt-1">{rechazadas}</div>
          <div className="text-[12px] text-[var(--color-danger-500)] mt-1">
            {totalReservas > 0 ? Math.round(rechazadas / totalReservas * 100) : 0}% tasa
          </div>
        </div>
      </div>

      {/* Section head */}
      <div className="flex items-center gap-[10px] mt-7 mb-[14px]">
        <h3 className="m-0 text-[17px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">Reservas recientes</h3>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse max-[900px]:min-w-[700px]">
            <thead>
              <tr>
                {["ID Alquilador", "ID Vehículo", "ID Propietario", "Fechas", "Estado"].map(h => (
                  <th key={h} className={thClass}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reservas.map(r => (
                <tr key={r.id_reserva} className="hover:[&>td]:bg-[color-mix(in_srgb,var(--color-primary-400)_4%,transparent)]">
                  <td className={tdClass}>{r.id_alquilador}</td>
                  <td className={tdClass}>{r.id_vehiculo}</td>
                  <td className={tdClass}>{r.id_propietario}</td>
                  <td className={tdClass}>{fmtDate(r.fecha_inicio)} → {fmtDate(r.fecha_final)}</td>
                  <td className={tdClass}><StatusBadge estado={r.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}