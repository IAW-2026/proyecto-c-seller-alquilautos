import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/ui/Badge";
import { MetricCard } from "@/components/ui/MetricCard";
import { fmtDate, fmtMoney, daysBetween } from "@/lib/utils";

const thClass = "text-left text-[11px] font-semibold tracking-[0.04em] uppercase text-[var(--text-tertiary)] px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-page)]";
const tdClass = "px-4 py-[14px] border-b border-[var(--border-default)] text-[13px] align-middle";
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

  // Métricas adicionales de la plataforma
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const inicioEstaSemana = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
  const inicioSemanaAnterior = new Date(ahora.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [
    reservasFinalizadas,
    totalReservasPlataforma,
    canceladas,
    propietariosEsteMes,
    reservasEstaSemana,
    reservasSemanaAnterior,
  ] = await Promise.all([
    db.reserva.findMany({
      where: { estado: "Finalizada" },
      select: {
        fecha_inicio: true,
        fecha_final: true,
        id_propietario: true,
        id_vehiculo: true,
        propietario: { select: { nombre: true, apellido: true } },
        vehiculo: { select: { marca: true, modelo: true, precio: true } },
      },
    }),
    db.reserva.count(),
    db.reserva.count({ where: { estado: "Cancelada" } }),
    db.propietario.count({ where: { createdAt: { gte: inicioMes } } }),
    db.reserva.count({ where: { createdAt: { gte: inicioEstaSemana, lte: ahora } } }),
    db.reserva.count({ where: { createdAt: { gte: inicioSemanaAnterior, lt: inicioEstaSemana } } }),
  ]);

  let ingresosTotales = 0;
  const ingresosPorPropietario = new Map<string, { nombre: string; apellido: string; ingresos: number }>();
  const alquileresPorVehiculo = new Map<string, { marca: string; modelo: string; cantidad: number }>();

  for (const r of reservasFinalizadas) {
    const ingreso = Number(r.vehiculo.precio) * daysBetween(r.fecha_inicio, r.fecha_final);
    ingresosTotales += ingreso;

    const propEntry = ingresosPorPropietario.get(r.id_propietario) ?? { nombre: r.propietario.nombre, apellido: r.propietario.apellido, ingresos: 0 };
    propEntry.ingresos += ingreso;
    ingresosPorPropietario.set(r.id_propietario, propEntry);

    const vehEntry = alquileresPorVehiculo.get(r.id_vehiculo) ?? { marca: r.vehiculo.marca, modelo: r.vehiculo.modelo, cantidad: 0 };
    vehEntry.cantidad += 1;
    alquileresPorVehiculo.set(r.id_vehiculo, vehEntry);
  }

  const propietarioTop = [...ingresosPorPropietario.values()].sort((a, b) => b.ingresos - a.ingresos)[0] ?? null;
  const vehiculoTop = [...alquileresPorVehiculo.values()].sort((a, b) => b.cantidad - a.cantidad)[0] ?? null;

  const tasaCancelacionGlobal = totalReservasPlataforma > 0
    ? ((canceladas + rechazadas) / totalReservasPlataforma) * 100
    : 0;

  const cambioReservasSemana = reservasSemanaAnterior > 0
    ? Math.round(((reservasEstaSemana - reservasSemanaAnterior) / reservasSemanaAnterior) * 100)
    : (reservasEstaSemana > 0 ? 100 : 0);

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
      <div className="flex items-center gap-[10px] mb-[14px]">
        <h3 className="m-0 text-[17px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">Métricas de la plataforma</h3>
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-3 gap-4 mb-7 max-[1200px]:grid-cols-2 max-[640px]:grid-cols-1">
        <MetricCard
          label="Ingresos totales"
          value={fmtMoney(ingresosTotales)}
          foot="Reservas finalizadas"
        />
        <MetricCard
          label="Reservas esta semana"
          value={reservasEstaSemana}
          foot={`${cambioReservasSemana >= 0 ? "+" : ""}${cambioReservasSemana}% vs. semana anterior`}
        />
        <MetricCard
          label="Propietario con más ingresos"
          value={propietarioTop ? `${propietarioTop.nombre} ${propietarioTop.apellido}` : "—"}
          foot={propietarioTop ? fmtMoney(propietarioTop.ingresos) : "Sin ingresos registrados"}
        />
        <MetricCard
          label="Vehículo más alquilado"
          value={vehiculoTop ? `${vehiculoTop.marca} ${vehiculoTop.modelo}` : "—"}
          foot={vehiculoTop ? `${vehiculoTop.cantidad} alquiler${vehiculoTop.cantidad === 1 ? "" : "es"} finalizados` : "Sin alquileres finalizados"}
        />
        <MetricCard
          label="Tasa de cancelación global"
          value={`${tasaCancelacionGlobal.toFixed(1)}%`}
          foot="Canceladas + Rechazadas"
        />
        <MetricCard
          label="Propietarios nuevos"
          value={propietariosEsteMes}
          foot="Registrados este mes"
        />
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