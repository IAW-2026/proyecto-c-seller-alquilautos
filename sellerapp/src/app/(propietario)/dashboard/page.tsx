import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getPropietario } from "@/lib/services/propietario.service";
import { getVehiculosByPropietario } from "@/lib/services/vehiculo.service";
import { getReservasByPropietario } from "@/lib/services/reserva.service";
import { MetricCard } from "@/components/ui/MetricCard";
import { VehiculosGrid } from "@/components/features/vehiculos/VehiculosGrid";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import { getDolarBlue } from "@/lib/utils";

export default async function DashboardPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const id_propietario = (sessionClaims?.publicMetadata as { id_propietario?: string })?.id_propietario;
  if (!id_propietario) redirect("/onboarding");

  const [, vehiculosResult, reservasResult, tipoCambio] = await Promise.all([
    getPropietario(id_propietario),
    getVehiculosByPropietario(id_propietario),
    getReservasByPropietario(id_propietario),
    getDolarBlue(),
  ]);

  

  const vehiculos = (vehiculosResult.data?.vehiculos ?? []).map(v => ({ ...v, precio: Number(v.precio) }));
  const reservas   = reservasResult.data?.reservas ?? [];
  const pendientes = reservas.filter(r => r.estado === "Pendiente");
  const aceptadas  = reservas.filter(r => r.estado === "Aceptada");
  const rechazadas = reservas.filter(r => r.estado === "Rechazada");

  return (
    <div>
      {/* Metrics row */}
      <div className="grid grid-cols-4 gap-4 max-[1200px]:grid-cols-2 max-[640px]:grid-cols-1 overflow-hidden">
        <MetricCard
          label="Vehículos publicados"
          value={vehiculos.length}
          foot="Total en tu flota"
          variant="primary"
          icon={
            <svg className="absolute right-3 bottom-3 opacity-15 max-w-[80px]" width="96" height="72" viewBox="0 0 96 72" fill="none">
              <rect x="6" y="14" width="84" height="48" rx="6" stroke="white" strokeWidth="2.5" />
              <circle cx="48" cy="38" r="11" stroke="white" strokeWidth="2.5" />
            </svg>
          }
        />
        <MetricCard label="Reservas aceptadas"  value={aceptadas.length}  foot="Total histórico" />
        <MetricCard label="Reservas rechazadas" value={rechazadas.length} foot="Total histórico" />

        {/* Metric card clickeable — pendientes */}
        <Link
          href="/dashboard/reservas?estado=Pendiente"
          aria-label={`${pendientes.length} reservas pendientes`}
          className={[
            "relative overflow-hidden min-h-[142px] flex flex-col gap-[6px] rounded-[var(--radius-lg)] p-[20px_22px] shadow-[var(--shadow-sm)] min-w-0 break-words no-underline text-inherit transition-[transform,box-shadow] duration-[180ms] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
            pendientes.length > 0
              ? "border border-[color-mix(in_srgb,var(--color-accent-400)_50%,transparent)] bg-[color-mix(in_srgb,var(--color-accent-400)_8%,var(--bg-surface))]"
              : "bg-[var(--bg-surface)] border border-[var(--border-default)]",
          ].join(" ")}
        >
          <div className="text-[13px] text-[var(--text-secondary)]">Reservas pendientes</div>
          <div className="text-[30px] font-bold tracking-[-0.02em]">
            {pendientes.length > 0 && (
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-accent-400)] mr-[6px] shadow-[0_0_0_0_color-mix(in_srgb,var(--color-accent-400)_60%,transparent)] animate-[pulse_1.6s_ease-out_infinite]" />
            )}
            {pendientes.length}
          </div>
          <div className="absolute top-4 right-4 text-[var(--text-tertiary)] transition-transform duration-[180ms] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            <Icon name="arrow" size={16} />
          </div>
          <div className="mt-auto text-[12px] text-[var(--text-secondary)]">
            {pendientes.length === 0
              ? "Todo al día"
              : <span className="text-[var(--color-accent-700)] font-semibold">Gestionar ahora</span>
            }
          </div>
        </Link>
      </div>

      <VehiculosGrid vehiculos={vehiculos} tipoCambio={tipoCambio}/>
    </div>
  );
}