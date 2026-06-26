import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getReservasByPropietario } from "@/lib/services/reserva.service";
import { getVehiculosByPropietario } from "@/lib/services/vehiculo.service";
import { getAlquilador } from "@/lib/mocks/buyerApp";
import { fmtDate, fmtMoney, daysBetween, getDolarBlue, pesToDolar, getRangoPeriodo } from "@/lib/utils";
import type { Alquilador } from "@/lib/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { IngresosFilterBar } from "@/components/features/ingresos/IngresosFilterBar";
import { ExportButtons } from "@/components/features/ingresos/ExportButtons";
import Link from "next/link";

const PERIODO_LABELS: Record<string, string> = {
  "7d": "Últimos 7 días",
  "30d": "Últimos 30 días",
  "90d": "Últimos 90 días",
  esteMes: "Este mes",
  esteAnio: "Este año",
  custom: "Rango personalizado",
};

const PAGE_SIZE = 8;
const kpiClass = "bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] px-5 py-[18px] shadow-[var(--shadow-sm)]";
const thClass  = "text-left text-[11px] font-semibold tracking-[0.04em] uppercase text-[var(--text-tertiary)] px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-page)]";
const tdClass  = "px-4 py-[14px] border-b border-[var(--border-default)] text-[13px] align-middle";
const linkBtnSmClass = "inline-flex items-center justify-center px-[10px] py-[6px] rounded-[var(--radius-md)] text-[12px] font-semibold bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-[background] duration-[180ms]";

export default async function IngresosPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; fechaDesde?: string; fechaHasta?: string; vehiculo?: string; page?: string }>;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const id_propietario = (sessionClaims?.publicMetadata as { id_propietario?: string })?.id_propietario;
  if (!id_propietario) redirect("/onboarding");

  const { periodo = "esteMes", fechaDesde, fechaHasta, vehiculo, page: pageParam = "1" } = await searchParams;
  const page = parseInt(pageParam, 10);

  const vehiculosResult = await getVehiculosByPropietario(id_propietario);
  const vehiculos = vehiculosResult.data?.vehiculos ?? [];

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

      {/* KPIs + table: only this part re-suspends when filters/page change */}
      <Suspense
        key={`${periodo}|${fechaDesde ?? ""}|${fechaHasta ?? ""}|${vehiculo ?? ""}|${page}`}
        fallback={<IngresosContentSkeleton />}
      >
        <IngresosContent
          id_propietario={id_propietario}
          periodo={periodo}
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          vehiculo={vehiculo}
          page={page}
          vehiculos={vehiculos}
        />
      </Suspense>
    </div>
  );
}

async function IngresosContent({
  id_propietario,
  periodo,
  fechaDesde,
  fechaHasta,
  vehiculo,
  page,
  vehiculos,
}: {
  id_propietario: string;
  periodo: string;
  fechaDesde?: string;
  fechaHasta?: string;
  vehiculo?: string;
  page: number;
  vehiculos: { id_vehiculo: string; marca: string; modelo: string; precio: number }[];
}) {
  const { desde, hasta } = getRangoPeriodo(periodo, fechaDesde, fechaHasta);

  const [reservasResult, tipoCambio] = await Promise.all([
    getReservasByPropietario(id_propietario, {
      estados: ["Finalizada"],
      id_vehiculo: vehiculo,
      fechaDesde: desde,
      fechaHasta: hasta,
    }),
    getDolarBlue(),
  ]);

  const finalizadas = reservasResult.data?.reservas ?? [];
  const vehiculosMap = Object.fromEntries(vehiculos.map(v => [v.id_vehiculo, v]));

  // KPIs y export se calculan sobre el período completo; solo la tabla se pagina.
  const totalMes = finalizadas.reduce((sum, r) => {
    const v    = vehiculosMap[r.id_vehiculo];
    const dias = daysBetween(r.fecha_inicio, r.fecha_final);
    return sum + (v ? Number(v.precio) * dias : 0);
  }, 0);

  const ticketPromedio = finalizadas.length > 0 ? totalMes / finalizadas.length : 0;

  const totalPages = Math.max(1, Math.ceil(finalizadas.length / PAGE_SIZE));
  const pageItems   = finalizadas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const filterParams = new URLSearchParams();
  if (periodo !== "esteMes") filterParams.set("periodo", periodo);
  if (fechaDesde) filterParams.set("fechaDesde", fechaDesde);
  if (fechaHasta) filterParams.set("fechaHasta", fechaHasta);
  if (vehiculo) filterParams.set("vehiculo", vehiculo);
  const filtrosQuery = filterParams.toString();

  const alquiladoresMap: Record<string, Alquilador | undefined> = {};
  await Promise.all(pageItems.map(async r => {
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

  return (
    <>
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
              {pageItems.map(r => {
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-default)] text-[12px] text-[var(--text-secondary)] bg-[var(--bg-page)]">
            <span>Página {page} de {totalPages}</span>
            <div className="flex gap-2">
              {page > 1          && <Link href={`?${filtrosQuery}${filtrosQuery ? "&" : ""}page=${page - 1}`} className={linkBtnSmClass}>Anterior</Link>}
              {page < totalPages && <Link href={`?${filtrosQuery}${filtrosQuery ? "&" : ""}page=${page + 1}`} className={linkBtnSmClass}>Siguiente</Link>}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function IngresosContentSkeleton() {
  return (
    <>
      {/* KPIs */}
      <div className="grid gap-[14px] mb-7" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={kpiClass}>
            <Skeleton className="h-[12px] w-[110px]" />
            <Skeleton className="h-[26px] w-[120px] mt-2" />
            <Skeleton className="h-[11px] w-[80px] mt-2" />
          </div>
        ))}
      </div>

      {/* Section head */}
      <div className="flex items-center justify-between gap-[10px] mt-7 mb-[14px] flex-wrap">
        <Skeleton className="h-[17px] w-[70px]" />
        <div className="flex gap-2">
          <Skeleton className="h-[34px] w-[80px]" />
          <Skeleton className="h-[34px] w-[70px]" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse max-[900px]:min-w-[700px]">
            <thead>
              <tr>
                {["Fecha", "Vehículo", "Alquilador", "Días", "Monto"].map((h, i) => (
                  <th key={i} className={thClass}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className={tdClass}><Skeleton className="h-[13px] w-[70px]" /></td>
                  <td className={tdClass}><Skeleton className="h-[13px] w-[110px]" /></td>
                  <td className={tdClass}><Skeleton className="h-[13px] w-[120px]" /></td>
                  <td className={tdClass}><Skeleton className="h-[13px] w-[20px]" /></td>
                  <td className={tdClass}>
                    <Skeleton className="h-[13px] w-[90px]" />
                    <Skeleton className="h-[11px] w-[60px] mt-1" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
