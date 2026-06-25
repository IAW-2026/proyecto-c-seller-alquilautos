import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/Badge";
import { MetricCard } from "@/components/ui/MetricCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { EditarPropietarioModal } from "@/components/features/admin/EditarPropietarioModal";
import { VerImagenModal } from "@/components/features/admin/VerImagenModal";
import { fmtDate, fmtMoney, daysBetween, getCloudinaryUrl } from "@/lib/utils";
import { getPromedioPropietario } from "@/lib/mocks/feedbackApp";
import { EstadoReserva } from "@prisma/client";

const thClass    = "text-left text-[11px] font-semibold tracking-[0.04em] uppercase text-[var(--text-tertiary)] px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-page)]";
const tdClass    = "px-4 py-[14px] border-b border-[var(--border-default)] text-[13px] align-middle";
const linkBtnSmClass = "inline-flex items-center justify-center px-[10px] py-[6px] rounded-[var(--radius-md)] text-[12px] font-semibold bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-[background] duration-[180ms]";

const ESTADOS_ACEPTADA_O_POSTERIOR: EstadoReserva[] = ["Aceptada", "Coordinada", "Pagada", "Entregada", "Finalizada"];
const RESERVAS_PAGE_SIZE = 8;

export default async function PropietarioDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ reservasPage?: string }>;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  if (role !== "adminSeller") redirect("/dashboard");

  const { id } = await params;
  const { reservasPage: reservasPageParam = "1" } = await searchParams;
  const reservasPage = parseInt(reservasPageParam, 10);

  const [propietario, vehiculos, reservasHistorial, totalReservasHistorial, reservasTodas, promedioResult] = await Promise.all([
    db.propietario.findUnique({ where: { id_propietario: id } }),
    db.vehiculo.findMany({ where: { id_propietario: id }, orderBy: { createdAt: "desc" } }),
    db.reserva.findMany({
      where: { id_propietario: id },
      orderBy: { createdAt: "desc" },
      skip: (reservasPage - 1) * RESERVAS_PAGE_SIZE,
      take: RESERVAS_PAGE_SIZE,
      include: { vehiculo: true },
    }),
    db.reserva.count({ where: { id_propietario: id } }),
    db.reserva.findMany({
      where: { id_propietario: id },
      select: {
        estado: true,
        fecha_inicio: true,
        fecha_final: true,
        id_vehiculo: true,
        vehiculo: { select: { marca: true, modelo: true, fotos: true, precio: true } },
      },
    }),
    getPromedioPropietario(id),
  ]);

  if (!propietario) notFound();

  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

  let ingresosTotales = 0;
  let ingresosMes = 0;
  let reservasFinalizadas = 0;
  let reservasAceptadasOPosterior = 0;

  const alquileresPorVehiculo = new Map<string, { marca: string; modelo: string; fotos: string; precio: number; cantidad: number }>();

  for (const r of reservasTodas) {
    if (r.estado === "Finalizada") {
      const monto = Number(r.vehiculo.precio) * daysBetween(r.fecha_inicio, r.fecha_final);
      ingresosTotales += monto;
      reservasFinalizadas += 1;
      if (r.fecha_inicio >= inicioMes) ingresosMes += monto;

      const entry = alquileresPorVehiculo.get(r.id_vehiculo) ?? {
        marca: r.vehiculo.marca,
        modelo: r.vehiculo.modelo,
        fotos: r.vehiculo.fotos,
        precio: Number(r.vehiculo.precio),
        cantidad: 0,
      };
      entry.cantidad += 1;
      alquileresPorVehiculo.set(r.id_vehiculo, entry);
    }
    if (ESTADOS_ACEPTADA_O_POSTERIOR.includes(r.estado)) reservasAceptadasOPosterior += 1;
  }

  const tasaAceptacion = reservasTodas.length > 0 ? (reservasAceptadasOPosterior / reservasTodas.length) * 100 : 0;
  const promedio = promedioResult.data;
  const vehiculoTop = [...alquileresPorVehiculo.values()].sort((a, b) => b.cantidad - a.cantidad)[0] ?? null;
  const totalReservasPages = Math.max(1, Math.ceil(totalReservasHistorial / RESERVAS_PAGE_SIZE));

  return (
    <div>
      {/* Page header */}
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap max-[900px]:flex-col max-[900px]:items-start">
        <div>
          <h2 className="m-0 text-[22px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">
            {propietario.nombre} {propietario.apellido}
          </h2>
          <div className="text-[13px] text-[var(--text-secondary)] mt-1">ID {propietario.id_propietario}</div>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <Link
            href="/admin/propietarios"
            className="inline-flex items-center gap-2 px-[16px] py-[9px] rounded-[var(--radius-md)] text-[13px] font-semibold bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-[background] duration-[180ms]"
          >
            <Icon name="chevronLeft" size={14} /> Volver
          </Link>
          <Link
            href={`/admin/reservas?propietario=${propietario.id_propietario}`}
            className="inline-flex items-center justify-center px-[16px] py-[9px] rounded-[var(--radius-md)] text-[13px] font-semibold bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-[background] duration-[180ms]"
          >
            Ver todas sus reservas
          </Link>
          <EditarPropietarioModal propietario={propietario} />
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-5 gap-4 mb-7 max-[1200px]:grid-cols-3 max-[700px]:grid-cols-2 max-[480px]:grid-cols-1">
        <MetricCard label="Ingresos totales" value={fmtMoney(ingresosTotales)} foot="Reservas finalizadas" />
        <MetricCard label="Ingresos este mes" value={fmtMoney(ingresosMes)} foot="Mes actual" />
        <MetricCard label="Reservas finalizadas" value={reservasFinalizadas} foot="Total histórico" />
        <MetricCard label="Tasa de aceptación" value={`${tasaAceptacion.toFixed(1)}%`} foot="Aceptadas o posteriores" />
        <MetricCard
          label="Calificación promedio"
          value={typeof promedio?.calificacion_promedio === "number" ? promedio.calificacion_promedio.toFixed(1) : "—"}
          foot={promedio ? `${promedio.cantidad_resenas} reseña${promedio.cantidad_resenas === 1 ? "" : "s"}` : "Sin reseñas"}
        />
      </div>

      {/* Datos del propietario + Vehículo más alquilado */}
      <div className="grid grid-cols-2 gap-6 mb-7 max-[900px]:grid-cols-1">
        <div>
          <div className="flex items-center gap-[10px] mb-[14px]">
            <h3 className="m-0 text-[17px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">Datos del propietario</h3>
          </div>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)]">
            {[
              { label: "Nombre",              value: propietario.nombre },
              { label: "Apellido",            value: propietario.apellido },
              { label: "Email",               value: propietario.email },
              { label: "DNI",                 value: propietario.dni },
              { label: "Dirección",           value: propietario.direccion },
              { label: "Teléfono",            value: propietario.telefono ?? "—" },
              { label: "Fecha de nacimiento", value: fmtDate(propietario.fecha_nacimiento) },
            ].map(({ label, value }, i) => (
              <div
                key={label}
                className={[
                  "flex items-center justify-between gap-4 px-6 py-[12px] last:border-b-0 border-b border-[var(--border-default)]",
                  i % 2 === 0 ? "bg-[var(--bg-page)]" : "bg-[var(--bg-surface)]",
                ].join(" ")}
              >
                <span className="text-[12px] font-semibold uppercase tracking-[0.03em] text-[var(--text-tertiary)]">{label}</span>
                <span className="text-[14px] font-semibold text-[var(--text-primary)] text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-[10px] mb-[14px]">
            <h3 className="m-0 text-[17px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">Vehículo más alquilado</h3>
          </div>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)] flex-1 flex flex-col">
            {vehiculoTop ? (
              <>
                {[
                  { label: "Vehículo",                value: `${vehiculoTop.marca} ${vehiculoTop.modelo}` },
                  { label: "Alquileres finalizados",   value: vehiculoTop.cantidad },
                  { label: "Precio por día",            value: fmtMoney(vehiculoTop.precio) },
                ].map(({ label, value }, i) => (
                  <div
                    key={label}
                    className={[
                      "flex items-center justify-between gap-4 px-6 py-[12px] border-b border-[var(--border-default)]",
                      i % 2 === 0 ? "bg-[var(--bg-page)]" : "bg-[var(--bg-surface)]",
                    ].join(" ")}
                  >
                    <span className="text-[12px] font-semibold uppercase tracking-[0.03em] text-[var(--text-tertiary)]">{label}</span>
                    <span className="text-[14px] font-semibold text-[var(--text-primary)] text-right">{value}</span>
                  </div>
                ))}
                <div className="relative flex-1 min-h-[180px]">
                  {vehiculoTop.fotos ? (
                    <VerImagenModal
                      variant="cover"
                      src={getCloudinaryUrl(vehiculoTop.fotos, 800, 500)}
                      alt={`${vehiculoTop.marca} ${vehiculoTop.modelo}`}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-page)]">
                      <span className="text-[13px] text-[var(--text-secondary)]">Sin foto disponible</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState icon="car" title="Sin alquileres" message="Todavía no hay reservas finalizadas para destacar un vehículo." />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vehículos */}
      <div className="flex items-center gap-[10px] mb-[14px]">
        <h3 className="m-0 text-[17px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">Vehículos</h3>
      </div>
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)] mb-7">
        {vehiculos.length === 0 ? (
          <EmptyState icon="car" title="Sin vehículos" message="Este propietario todavía no publicó vehículos." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse max-[700px]:min-w-[500px]">
              <thead>
                <tr>
                  {["Vehículo", "Año", "Precio/día", "Estado"].map(h => (
                    <th key={h} className={thClass}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vehiculos.map(v => (
                  <tr key={v.id_vehiculo} className="hover:[&>td]:bg-[color-mix(in_srgb,var(--color-primary-400)_4%,transparent)]">
                    <td className={tdClass}>{v.marca} {v.modelo}</td>
                    <td className={tdClass}>{v.anio}</td>
                    <td className={tdClass}><strong className="text-[var(--color-primary-400)]">{fmtMoney(v.precio)}</strong></td>
                    <td className={tdClass}><StatusBadge estado={v.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historial de reservas */}
      <div className="flex items-center gap-[10px] mb-[14px]">
        <h3 className="m-0 text-[17px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">Historial de reservas</h3>
      </div>
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)]">
        {reservasHistorial.length === 0 ? (
          <EmptyState icon="calendar" title="Sin reservas" message="Este propietario todavía no tiene reservas." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse max-[700px]:min-w-[600px]">
                <thead>
                  <tr>
                    {["Vehículo", "Fechas", "Días", "Estado"].map(h => (
                      <th key={h} className={thClass}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reservasHistorial.map(r => (
                    <tr key={r.id_reserva} className="hover:[&>td]:bg-[color-mix(in_srgb,var(--color-primary-400)_4%,transparent)]">
                      <td className={tdClass}>{r.vehiculo.marca} {r.vehiculo.modelo}</td>
                      <td className={tdClass}>{fmtDate(r.fecha_inicio)} → {fmtDate(r.fecha_final)}</td>
                      <td className={tdClass}>{daysBetween(r.fecha_inicio, r.fecha_final)}</td>
                      <td className={tdClass}><StatusBadge estado={r.estado} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalReservasPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-default)] text-[12px] text-[var(--text-secondary)] bg-[var(--bg-page)]">
                <span>Página {reservasPage} de {totalReservasPages}</span>
                <div className="flex gap-2">
                  {reservasPage > 1                  && <Link href={`?reservasPage=${reservasPage - 1}`} className={linkBtnSmClass}>Anterior</Link>}
                  {reservasPage < totalReservasPages  && <Link href={`?reservasPage=${reservasPage + 1}`} className={linkBtnSmClass}>Siguiente</Link>}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
