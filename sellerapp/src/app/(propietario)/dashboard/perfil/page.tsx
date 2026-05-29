import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getPropietario } from "@/lib/services/propietario.service";
import { getResumenPropietario, getResenasPropietario, getPromedioPropietario } from "@/lib/mocks/feedbackApp";
import { EditarPerfilModal } from "@/components/features/configuracion/EditarPerfilModal";
import { fmtDate } from "@/lib/utils";

export default async function ConfiguracionPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const id_propietario = (sessionClaims?.publicMetadata as { id_propietario?: string })?.id_propietario;
  if (!id_propietario) redirect("/onboarding");

  const result = await getPropietario(id_propietario);
  if (result.error || !result.data) redirect("/dashboard");

  const propietario = result.data;

  const [promedio, resumen, resenas] = await Promise.all([
    getPromedioPropietario(id_propietario),
    getResumenPropietario(id_propietario),
    getResenasPropietario(id_propietario),
  ]);

  return (
    <div style={{ maxWidth: 1100 }}>
      <div className="page-header">
        <div>
          <h2>Mi perfil</h2>
          <div className="sub">Tus datos personales en AlquilAutos</div>
        </div>
        <EditarPerfilModal propietario={propietario} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 }}>
        {/* COLUMNA IZQUIERDA */}
        <div className="card-surface">
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Información personal</div>
          <div className="form-grid">
            <div className="field"><label>Nombre</label><div>{propietario.nombre}</div></div>
            <div className="field"><label>Apellido</label><div>{propietario.apellido}</div></div>
            <div className="field"><label>Email</label><div>{propietario.email}</div></div>
            <div className="field"><label>DNI</label><div>{propietario.dni}</div></div>
            <div className="field"><label>Fecha de nacimiento</label><div>{fmtDate(propietario.fecha_nacimiento)}</div></div>
            <div className="field"><label>Dirección</label><div>{propietario.direccion}</div></div>
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
                {resenas.resenas.map(r => (
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
          </div>
        </div>
      </div>
    </div>
  );
}