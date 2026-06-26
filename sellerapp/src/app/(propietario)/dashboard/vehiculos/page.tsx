import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getVehiculosByPropietario } from "@/lib/services/vehiculo.service";
import { getReservasByPropietario } from "@/lib/services/reserva.service";
import { VehiculoCard } from "@/components/features/vehiculos/VehiculoCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import { getDolarBlue, daysBetween } from "@/lib/utils"

const PAGE_SIZE = 10;

const linkBtnClass = "inline-flex items-center gap-2 px-[16px] py-[9px] rounded-[var(--radius-md)] text-[13px] font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-bg-hover)] transition-[background] duration-[180ms]";
const linkBtnSmClass = "inline-flex items-center justify-center px-[10px] py-[6px] rounded-[var(--radius-md)] text-[12px] font-semibold bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-[background] duration-[180ms]";

export default async function VehiculosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const id_propietario = (sessionClaims?.publicMetadata as { id_propietario?: string })?.id_propietario;
  if (!id_propietario) redirect("/onboarding");

  const { q = "", page: pageParam = "1" } = await searchParams;
  const page = parseInt(pageParam, 10);

  const [result, reservasFinalizadasResult, tipoCambio] = await Promise.all([
    getVehiculosByPropietario(id_propietario),
    getReservasByPropietario(id_propietario, { estados: ["Finalizada"] }),
    getDolarBlue(),
  ]);
  const todos = result.data?.vehiculos ?? [];

  const filtered = todos.filter(v => {
    const s = q.toLowerCase();
    return !s || `${v.marca} ${v.modelo}`.toLowerCase().includes(s) || v.anio.toString().includes(s);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Una sola query de reservas finalizadas para todos los vehículos del propietario,
  // agrupada en memoria por id_vehiculo (evita N+1 contra la base).
  const precioPorVehiculo = new Map(todos.map(v => [v.id_vehiculo, v.precio]));
  const statsPorVehiculo = new Map<string, { vecesAlquilado: number; totalGenerado: number }>();
  for (const r of reservasFinalizadasResult.data?.reservas ?? []) {
    const precio = precioPorVehiculo.get(r.id_vehiculo);
    if (precio === undefined) continue;
    const dias = daysBetween(r.fecha_inicio, r.fecha_final);
    const prev = statsPorVehiculo.get(r.id_vehiculo) ?? { vecesAlquilado: 0, totalGenerado: 0 };
    statsPorVehiculo.set(r.id_vehiculo, {
      vecesAlquilado: prev.vecesAlquilado + 1,
      totalGenerado: prev.totalGenerado + precio * dias,
    });
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap max-[900px]:flex-col max-[900px]:items-start">
        <div>
          <h2 className="m-0 text-[22px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">Mi Flota</h2>
          <div className="text-[13px] text-[var(--text-secondary)] mt-1">
            {filtered.length} vehículo{filtered.length === 1 ? "" : "s"} en tu cuenta
          </div>
        </div>
        <Link href="/dashboard/vehiculos/nuevo" className={linkBtnClass}>
          <Icon name="plus" size={14} /> Añadir Vehículo
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)] mb-5">
        <div className="flex gap-3 items-center px-4 py-[14px] border-b border-[var(--border-default)] flex-wrap">
          <form>
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Buscar por marca, modelo o ubicación..."
              aria-label="Buscar vehículos"
              className="border border-[var(--border-default)] bg-[var(--bg-page)] text-[var(--text-primary)] px-3 py-2 rounded-[var(--radius-md)] text-[13px] font-[inherit] outline-none min-w-[240px]"
            />
          </form>
          <div className="ml-auto flex gap-[10px] items-center">
            <span className="text-[var(--text-secondary)] text-[13px]">{filtered.length} resultados</span>
          </div>
        </div>
      </div>

      {/* Content */}
      {pageItems.length === 0 ? (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-sm)]">
          <EmptyState
            icon="car"
            title="Sin resultados"
            message={q ? `No encontramos vehículos para "${q}"` : "No tenés vehículos cargados aún."}
            action={
              !q && (
                <Link href="/dashboard/vehiculos/nuevo" className={linkBtnClass}>
                  <Icon name="plus" size={14} /> Añadir Vehículo
                </Link>
              )
            }
          />
        </div>
      ) : (
        <>
          <div className="grid gap-[18px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {pageItems.map(v => {
              const stats = statsPorVehiculo.get(v.id_vehiculo);
              return (
                <VehiculoCard
                  key={v.id_vehiculo}
                  vehiculo={v}
                  tipoCambio={tipoCambio}
                  vecesAlquilado={stats?.vecesAlquilado ?? 0}
                  totalGenerado={stats?.totalGenerado ?? 0}
                />
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5 text-[12px] text-[var(--text-secondary)]">
              <span>Página {page} de {totalPages}</span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={`?q=${q}&page=${page - 1}`} className={linkBtnSmClass}>Anterior</Link>
                )}
                {page < totalPages && (
                  <Link href={`?q=${q}&page=${page + 1}`} className={linkBtnSmClass}>Siguiente</Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}