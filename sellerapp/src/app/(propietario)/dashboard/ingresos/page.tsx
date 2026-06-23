import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getReservasByPropietario } from "@/lib/services/reserva.service";
import { getVehiculosByPropietario } from "@/lib/services/vehiculo.service";
import { getAlquilador } from "@/lib/mocks/buyerApp";
import { fmtDate, fmtMoney, daysBetween, getDolarBlue, pesToDolar, getRangoPeriodo } from "@/lib/utils";
import type { Alquilador } from "@/lib/types";
import { IngresosFilterBar } from "@/components/features/ingresos/IngresosFilterBar";
import { ExportButtons } from "@/components/features/ingresos/ExportButtons";

const PERIODO_LABELS: Record<string, string> = {
  "7d": "Últimos 7 días",
  "30d": "Últimos 30 días",
  "90d": "Últimos 90 días",
  esteMes: "Este mes",
  esteAnio: "Este año",
  custom: "Rango personalizado",
};

export default async function IngresosPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; fechaDesde?: string; fechaHasta?: string; vehiculo?: string }>;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const id_propietario = (sessionClaims?.publicMetadata as { id_propietario?: string })?.id_propietario;
  if (!id_propietario) redirect("/onboarding");

  const { periodo = "esteMes", fechaDesde, fechaHasta, vehiculo } = await searchParams;
  const { desde, hasta } = getRangoPeriodo(periodo, fechaDesde, fechaHasta);

  const [reservasResult, vehiculosResult, tipoCambio] = await Promise.all([
    getReservasByPropietario(id_propietario, {
      estados: ["Finalizada"],
      id_vehiculo: vehiculo,
      fechaDesde: desde,
      fechaHasta: hasta,
    }),
    getVehiculosByPropietario(id_propietario),
    getDolarBlue(),
  ]);

  const finalizadas = reservasResult.data?.reservas ?? [];
  const vehiculos   = vehiculosResult.data?.vehiculos ?? [];

  const vehiculosMap = Object.fromEntries(vehiculos.map(v => [v.id_vehiculo, v]));

  const totalMes = finalizadas.reduce((sum, r) => {
    const v    = vehiculosMap[r.id_vehiculo];
    const dias = daysBetween(r.fecha_inicio, r.fecha_final);
    return sum + (v ? Number(v.precio) * dias : 0);
  }, 0);

  const ticketPromedio = finalizadas.length > 0 ? totalMes / finalizadas.length : 0;

  const alquiladoresMap: Record<string, Alquilador | undefined> = {};
  await Promise.all(finalizadas.map(async r => {
    alquiladoresMap[r.id_alquilador] = (await getAlquilador(r.id_alquilador)).data ?? undefined;
  }));

  const exportRows = finalizadas.map(r => {
    const v         = vehiculosMap[r.id_vehiculo];
    const dias      = daysBetween(r.fecha_inicio, r.fecha_final);
    const precioDia = v ? Number(v.precio) : 0;
    const totalARS  = precioDia * dias;
    const totalUSD  = tipoCambio > 0 ? totalARS / tipoCambio : 0;
    return {
      fechaInicio: fmtDate(r.fecha_inicio),
      fechaFinal: fmtDate(r.fecha_final),
      vehiculo: v ? `${v.marca} ${v.modelo}` : r.id_vehiculo,
      dias,
      precioDia,
      totalARS,
      totalUSD,
    };
  });

  const kpiClass   = "bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] px-5 py-[18px] shadow-[var(--shadow-sm)]";
  const thClass    = "text-left text-[11px] font-semibold tracking-[0.04em] uppercase text-[var(--text-tertiary)] px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-page)]";
  const tdClass    = "px-4 py-[14px] border-b border-[var(--border-default)] text-[13px] align-middle";

  return (
    <div>
      {/* Page header */}
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap max-[900px]:flex-col max-[900px]:items-start">
        <div>
          <h2 className="m-0 text-[22px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">Ingresos</h2>
          <div className="text-[13px] text-[var(--text-secondary)] mt-1">Resumen de tus cobros según el período seleccionado</div>
        </div>
        <IngresosFilterBar
          periodoActual={periodo}
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          vehiculoActual={vehiculo}
          vehiculos={vehiculos}
        />
      </div>

      {/* KPIs */}
      <div className="grid gap-[14px] mb-7" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <div className={kpiClass}>
          <div className="text-[12px] text-[var(--text-secondary)]">Total del período</div>
          <div className="text-[26px] font-bold tracking-[-0.01em] mt-1">{fmtMoney(totalMes)}</div>
          <div className="text-[11px] text-[var(--text-tertiary)] mt-1">{PERIODO_LABELS[periodo] ?? PERIODO_LABELS.esteMes}</div>
          {tipoCambio > 0 && (
            <div className="text-[12px] text-[var(--text-tertiary)] mt-1">{pesToDolar(totalMes, tipoCambio)}</div>
          )}
        </div>
        <div className={kpiClass}>
          <div className="text-[12px] text-[var(--text-secondary)]">Reservas finalizadas</div>
          <div className="text-[26px] font-bold tracking-[-0.01em] mt-1">{finalizadas.length}</div>
        </div>
        <div className={kpiClass}>
          <div className="text-[12px] text-[var(--text-secondary)]">Precio promedio</div>
          <div className="text-[26px] font-bold tracking-[-0.01em] mt-1">{fmtMoney(ticketPromedio)}</div>
          {tipoCambio > 0 && (
            <div className="text-[12px] text-[var(--text-tertiary)] mt-1">{pesToDolar(ticketPromedio, tipoCambio)}</div>
          )}
        </div>
      </div>

      {/* Section head */}
      <div className="flex items-center justify-between gap-[10px] mt-7 mb-[14px] flex-wrap">
        <h3 className="m-0 text-[17px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">Detalle</h3>
        <ExportButtons rows={exportRows} periodoLabel={PERIODO_LABELS[periodo] ?? PERIODO_LABELS.esteMes} />
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse max-[900px]:min-w-[700px]">
            <thead>
              <tr>
                <th className={thClass}>Fecha</th>
                <th className={thClass}>Vehículo</th>
                <th className={thClass}>Alquilador</th>
                <th className={thClass}>Días</th>
                <th className={thClass}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {finalizadas.map(r => {
                const v     = vehiculosMap[r.id_vehiculo];
                const al    = alquiladoresMap[r.id_alquilador];
                const dias  = daysBetween(r.fecha_inicio, r.fecha_final);
                const monto = v ? Number(v.precio) * dias : 0;
                return (
                  <tr key={r.id_reserva} className="hover:[&>td]:bg-[color-mix(in_srgb,var(--color-primary-400)_4%,transparent)]">
                    <td className={tdClass}>{fmtDate(r.fecha_inicio)}</td>
                    <td className={tdClass}>{v ? `${v.marca} ${v.modelo}` : r.id_vehiculo}</td>
                    <td className={tdClass}>{al ? `${al.nombre} ${al.apellido}` : r.id_alquilador}</td>
                    <td className={tdClass}>{dias}</td>
                    <td className={tdClass}>
                      <strong className="text-[var(--color-primary-400)]">{fmtMoney(monto)}</strong>
                      {tipoCambio > 0 && (
                        <div className="text-[11px] text-[var(--text-tertiary)]">{pesToDolar(monto, tipoCambio)}</div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {finalizadas.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-[var(--text-secondary)] p-8">
                    No hay ingresos registrados en el período seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}