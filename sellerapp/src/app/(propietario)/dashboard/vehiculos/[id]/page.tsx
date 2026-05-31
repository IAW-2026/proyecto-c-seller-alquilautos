import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getVehiculo } from "@/lib/services/vehiculo.service";
import { getResumenVehiculo, getResenasVehiculo, getPromedioVehiculo } from "@/lib/mocks/feedbackApp";
import { StatusBadge } from "@/components/ui/Badge";
import { fmtMoney } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import { EditarVehiculoModal } from "@/components/features/vehiculos/EditarVehiculoModal";

const PAGE_SIZE = 5;
const cardClass  = "bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-sm)]";
const labelClass = "text-[12px] font-semibold text-[var(--text-secondary)]";
const fieldClass = "flex flex-col gap-[4px]";
const linkBtnSmClass = "inline-flex items-center justify-center px-[10px] py-[6px] rounded-[var(--radius-md)] text-[12px] font-semibold bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-[background] duration-[180ms]";

export default async function VehiculoDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const metadata = sessionClaims?.publicMetadata as { role?: string; id_propietario?: string };
  if (!metadata?.id_propietario) redirect("/onboarding");

  const { id }   = await params;
  const result   = await getVehiculo(id);
  if (result.error || !result.data) notFound();
  const vehiculo = result.data;

  const [promedio, resumen, resenas] = await Promise.all([
    getPromedioVehiculo(id),
    getResumenVehiculo(id),
    getResenasVehiculo(id),
  ]);

  const { page: pageParam = "1" } = await searchParams;
  const page       = parseInt(pageParam, 10);
  const totalPages = Math.max(1, Math.ceil(resenas.resenas.length / PAGE_SIZE));
  const pageItems  = resenas.resenas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Page header */}
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap max-[900px]:flex-col max-[900px]:items-start">
        <div>
          <h2 className="m-0 text-[22px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">
            {vehiculo.marca} {vehiculo.modelo}
          </h2>
          <div className="text-[13px] text-[var(--text-secondary)] mt-1">{vehiculo.anio}</div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/vehiculos"
            className="inline-flex items-center gap-2 px-[16px] py-[9px] rounded-[var(--radius-md)] text-[13px] font-semibold bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-[background] duration-[180ms]"
          >
            <Icon name="chevronLeft" size={14} /> Volver
          </Link>
          <EditarVehiculoModal vehiculo={vehiculo} />
        </div>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-[1fr_380px] gap-6 max-[900px]:grid-cols-1">

        {/* Columna izquierda */}
        <div className="flex flex-col gap-5">
          <div className="rounded-[var(--radius-lg)] overflow-hidden aspect-video bg-[var(--color-neutral-100)]">
            {vehiculo.fotos
              ? <img src={vehiculo.fotos} alt={`${vehiculo.marca} ${vehiculo.modelo}`} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)]">Sin foto</div>
            }
          </div>

          <div className={cardClass}>
            <div className="text-[13px] font-bold mb-4 text-[var(--text-primary)]">Información del vehículo</div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-[18px] max-[700px]:grid-cols-1">
              <div className={fieldClass}>
                <span className={labelClass}>Marca</span>
                <span className="text-[14px] text-[var(--text-primary)]">{vehiculo.marca}</span>
              </div>
              <div className={fieldClass}>
                <span className={labelClass}>Modelo</span>
                <span className="text-[14px] text-[var(--text-primary)]">{vehiculo.modelo}</span>
              </div>
              <div className={fieldClass}>
                <span className={labelClass}>Año</span>
                <span className="text-[14px] text-[var(--text-primary)]">{vehiculo.anio}</span>
              </div>
              <div className={fieldClass}>
                <span className={labelClass}>Precio por día</span>
                <span className="text-[14px] font-bold text-[var(--color-primary-400)]">{fmtMoney(vehiculo.precio)}</span>
              </div>
              <div className={fieldClass}>
                <span className={labelClass}>Estado</span>
                <div>
                  <StatusBadge estado={vehiculo.estado ?? "Disponible"} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="flex flex-col gap-4">
          <div className={cardClass}>
            <div className="text-[13px] font-bold mb-4 text-[var(--text-primary)]">Calificación general</div>
            <div className="text-[32px] font-extrabold text-[var(--color-primary-400)]">
              {promedio.calificacion_promedio}
            </div>
            <div className="text-[12px] text-[var(--text-secondary)] mb-4">
              Basado en {promedio.cantidad_resenas} reseñas
            </div>
            <div className="text-[13px] text-[var(--text-secondary)] italic">{resumen.resumen}</div>
          </div>

          <div className={cardClass}>
            <div className="text-[13px] font-bold mb-4 text-[var(--text-primary)]">Reseñas recientes</div>
            {resenas.resenas.length === 0 ? (
              <div className="text-[13px] text-[var(--text-secondary)]">Sin reseñas aún.</div>
            ) : (
              <div className="flex flex-col gap-4">
                {pageItems.map(r => (
                  <div key={r.id_resena} className="border-b border-[var(--border-default)] pb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] text-[var(--text-secondary)]">{r.fecha_creacion}</span>
                      <span className="text-[13px] font-bold text-[#f59e0b]">{"★".repeat(r.calificacion_general)}</span>
                    </div>
                    <div className="text-[13px] text-[var(--text-primary)]">{r.descripcion}</div>
                  </div>
                ))}
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-3">
                <span className="text-[12px] text-[var(--text-secondary)]">Página {page} de {totalPages}</span>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Link href={`?page=${page - 1}`} className={linkBtnSmClass} scroll={false}>Anterior</Link>
                  )}
                  {page < totalPages && (
                    <Link href={`?page=${page + 1}`} className={linkBtnSmClass} scroll={false}>Siguiente</Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}