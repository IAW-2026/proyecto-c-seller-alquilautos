import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getPropietario } from "@/lib/services/propietario.service";
import { getVehiculosByPropietario } from "@/lib/services/vehiculo.service";
import { getReservasByPropietario } from "@/lib/services/reserva.service";
import { MetricCard } from "@/components/ui/MetricCard";
import { VehiculoCard } from "@/components/features/vehiculos/VehiculoCard";
import { ReservaRow } from "@/components/features/reservas/ReservaRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const id_propietario = (sessionClaims?.publicMetadata as { id_propietario?: string })?.id_propietario;
  if (!id_propietario) redirect("/onboarding");

  const [propietarioResult, vehiculosResult, reservasResult] = await Promise.all([
    getPropietario(id_propietario),
    getVehiculosByPropietario(id_propietario),
    getReservasByPropietario(id_propietario),
  ]);

  const vehiculos = vehiculosResult.data?.vehiculos ?? [];
  const reservas = reservasResult.data?.reservas ?? [];
  const pendientes = reservas.filter(r => r.estado === "Pendiente");
  const aceptadas = reservas.filter(r => r.estado === "Aceptada");
  const rechazadas = reservas.filter(r => r.estado === "Rechazada");

  return (
    <div>
      <div className="metrics-row">
        <MetricCard
          label="Vehículos publicados"
          value={vehiculos.length}
          foot="Total en tu flota"
          variant="primary"
          icon={
            <svg className="bg" width="96" height="72" viewBox="0 0 96 72" fill="none">
              <rect x="6" y="14" width="84" height="48" rx="6" stroke="white" strokeWidth="2.5" />
              <circle cx="48" cy="38" r="11" stroke="white" strokeWidth="2.5" />
            </svg>
          }
        />
        <MetricCard
          label="Reservas aceptadas"
          value={aceptadas.length}
          foot="Total histórico"
        />
        <MetricCard
          label="Reservas rechazadas"
          value={rechazadas.length}
          foot="Total histórico"
        />
        <Link
          href="/dashboard/reservas?estado=Pendiente"
          className={"metric-card" + (pendientes.length > 0 ? " alert" : "")}
          aria-label={`${pendientes.length} reservas pendientes`}
        >
          <div className="label">Reservas pendientes</div>
          <div className="value">
            {pendientes.length > 0 && <span className="pulse-dot" />}
            {pendientes.length}
          </div>
          <div className="corner-arrow"><Icon name="arrow" size={16} /></div>
          <div className="foot">
            {pendientes.length === 0
              ? "Todo al día"
              : <span style={{ color: "var(--color-accent-700)", fontWeight: 600 }}>
                  Gestionar ahora
                </span>
            }
          </div>
        </Link>
      </div>

      <div className="dash-grid">
        <div>
          <div className="section-head">
            <h3>Reservas pendientes</h3>
            {pendientes.length > 0 && (
              <span className="counter">{pendientes.length}</span>
            )}
            <span className="spacer" />
            <Link href="/dashboard/reservas">Ver todas</Link>
          </div>
          <div className="res-list">
            {pendientes.length === 0 ? (
              <EmptyState
                icon="calendar"
                title="Sin reservas pendientes"
                message="No tenés reservas que requieran tu atención"
              />
            ) : (
              pendientes.map(r => (
                <ReservaRow key={r.id_reserva} reserva={r} />
              ))
            )}
          </div>
        </div>

        <div>
          <div className="section-head">
            <h3>Mis vehículos</h3>
            <span className="spacer" />
            <Link href="/dashboard/vehiculos">Ver todos</Link>
          </div>
          {vehiculos.length === 0 ? (
            <EmptyState
              icon="car"
              title="Sin vehículos"
              message="Publicá tu primer vehículo"
              action={
                <Link href="/dashboard/vehiculos/nuevo" className="btn primary">
                  <Icon name="plus" size={14} /> Publicar vehículo
                </Link>
              }
            />
          ) : (
            <div className="veh-grid">
              {vehiculos.slice(0, 3).map(v => (
                <VehiculoCard key={v.id_vehiculo} vehiculo={v} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}