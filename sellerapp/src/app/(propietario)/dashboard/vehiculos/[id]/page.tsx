import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getVehiculo } from "@/lib/services/vehiculo.service";
import { getResumenVehiculo, getResenasVehiculo,getPromedioVehiculo  } from "@/lib/mocks/feedbackApp";
import { StatusBadge } from "@/components/ui/Badge";
import { fmtMoney } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import { EditarVehiculoModal } from "@/components/features/vehiculos/EditarVehiculoModal";

const PAGE_SIZE = 5;

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

  const { id } = await params;
  const result = await getVehiculo(id);
  if (result.error || !result.data) notFound();

  const vehiculo = { ...result.data, precio: Number(result.data.precio) };

  const [promedio, resumen, resenas] = await Promise.all([
    getPromedioVehiculo(id),
    getResumenVehiculo(id),
    getResenasVehiculo(id),
  ]);

  const { page: pageParam = "1" } = await searchParams;
  const page = parseInt(pageParam, 10);

  const totalPages = Math.max(1, Math.ceil(resenas.resenas.length / PAGE_SIZE));
  const pageItems = resenas.resenas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ maxWidth: 1100 }}>
      <div className="page-header">
        <div>
          <h2>{vehiculo.marca} {vehiculo.modelo}</h2>
          <div className="sub">{vehiculo.anio}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/dashboard/vehiculos" className="btn ghost">
            <Icon name="chevronLeft" size={14} /> Volver
          </Link>
          <EditarVehiculoModal vehiculo={vehiculo} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 }}>
        {/* COLUMNA IZQUIERDA */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", aspectRatio: "16/9", background: "var(--surface-raised)" }}>
            {vehiculo.fotos?.[0]
              ? <img src={vehiculo.fotos[0]} alt={`${vehiculo.marca} ${vehiculo.modelo}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>Sin foto</div>
            }
          </div>

          <div className="card-surface">
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Información del vehículo</div>
            <div className="form-grid">
              <div className="field"><label>Marca</label><div>{vehiculo.marca}</div></div>
              <div className="field"><label>Modelo</label><div>{vehiculo.modelo}</div></div>
              <div className="field"><label>Año</label><div>{vehiculo.anio}</div></div>
              <div className="field"><label>Precio por día</label><div style={{ color: "var(--color-primary-400)", fontWeight: 700 }}>{fmtMoney(vehiculo.precio)}</div></div>
              <div className="field"><label>Estado</label><div><StatusBadge estado={vehiculo.estado ?? "Disponible"} /></div></div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA — RESEÑAS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card-surface">
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Calificación general</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "var(--color-primary-400)" }}>
              {promedio.calificacion_promedio}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>
              Basado en {promedio.cantidad_resenas} reseñas
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontStyle: "italic" }}>
              {resumen.resumen}
            </div>
          </div>

          <div className="card-surface">
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Reseñas recientes</div>
            {resenas.resenas.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Sin reseñas aún.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {pageItems.map(r => (
                  <div key={r.id_resena} style={{ borderBottom: "1px solid var(--border-default)", paddingBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{r.fecha_creacion}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b" }}>{"★".repeat(r.calificacion_general)}</span>
                    </div>
                    <div style={{ fontSize: 13 }}>{r.descripcion}</div>
                  </div>
                ))}
              </div>
            )}
            {totalPages > 1 && (
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Página {page} de {totalPages}</span>
                   <div style={{ display: "flex", gap: 8 }}>
                   {page > 1 && (
                       <Link href={`?page=${page - 1}`} className="btn secondary sm">Anterior</Link>
                  )}
                  {page < totalPages && (
                       <Link href={`?page=${page + 1}`} className="btn secondary sm">Siguiente</Link>
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