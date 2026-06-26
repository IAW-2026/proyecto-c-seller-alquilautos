import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getPropietario } from "@/lib/services/propietario.service";
import { getResumenPropietario, getResenasPropietario, getPromedioPropietario } from "@/lib/mocks/feedbackApp";
import { EditarPerfilModal } from "@/components/features/configuracion/EditarPerfilModal";
import { fmtDate } from "@/lib/utils";

const cardClass  = "bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-sm)]";
const labelClass = "text-[12px] font-semibold text-[var(--text-secondary)]";
const fieldClass = "flex flex-col gap-[4px]";

export default async function ConfiguracionPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const id_propietario = (sessionClaims?.publicMetadata as { id_propietario?: string })?.id_propietario;
  if (!id_propietario) redirect("/onboarding");

  const result = await getPropietario(id_propietario);
  if (result.error || !result.data) redirect("/dashboard");
  const propietario = result.data;

  const user = await currentUser();
  const fotoPerfilUrl = user?.imageUrl;
  const iniciales = `${propietario.nombre?.[0] ?? ""}${propietario.apellido?.[0] ?? ""}`.toUpperCase();

  const [promedioRes, resumenRes, resenasRes] = await Promise.all([
    getPromedioPropietario(id_propietario),
    getResumenPropietario(id_propietario),
    getResenasPropietario(id_propietario),
  ]);

  const promedio = promedioRes.data ?? { id_propietario, calificacion_promedio: 0, cantidad_resenas: 0 };
  const resumen  = resumenRes.data  ?? { id_propietario, resumen: "Sin reseñas aún." };
  const resenas  = resenasRes.data  ?? { resenas: [] };

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Page header */}
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap max-[900px]:flex-col max-[900px]:items-start">
        <div>
          <h2 className="m-0 text-[22px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">Mi perfil</h2>
          <div className="text-[13px] text-[var(--text-secondary)] mt-1">Tus datos personales en AlquilAutos</div>
        </div>
        <EditarPerfilModal propietario={propietario} />
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-[1fr_380px] gap-6 max-[900px]:grid-cols-1">

        {/* Columna izquierda */}
        <div className={cardClass}>
          <div className="flex items-center gap-4 mb-5">
            {fotoPerfilUrl ? (
              <img
                src={fotoPerfilUrl}
                alt={`${propietario.nombre} ${propietario.apellido}`}
                className="w-16 h-16 rounded-full object-cover border border-[var(--border-default)]"
              />
            ) : (
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-[18px] font-bold bg-[var(--color-primary-400)] text-white">
                {iniciales}
              </div>
            )}
            <div>
              <div className="text-[15px] font-bold text-[var(--text-primary)]">{propietario.nombre} {propietario.apellido}</div>
              <div className="text-[12px] text-[var(--text-secondary)]">{propietario.email}</div>
            </div>
          </div>
          <div className="text-[13px] font-bold mb-4 text-[var(--text-primary)]">Información personal</div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-[18px] max-[700px]:grid-cols-1">
            {[
              { label: "Nombre",             value: propietario.nombre },
              { label: "Apellido",           value: propietario.apellido },
              { label: "Email",              value: propietario.email },
              { label: "DNI",                value: propietario.dni },
              { label: "Fecha de nacimiento",value: fmtDate(propietario.fecha_nacimiento) },
              { label: "Dirección",          value: propietario.direccion },
              { label: "Teléfono",           value: propietario.telefono ?? "No especificado" },
            ].map(({ label, value }) => (
              <div key={label} className={fieldClass}>
                <span className={labelClass}>{label}</span>
                <span className="text-[14px] text-[var(--text-primary)]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Columna derecha */}
        <div className="flex flex-col gap-4">
          <div className={cardClass}>
            <div className="text-[13px] font-bold mb-4 text-[var(--text-primary)]">Calificación general</div>
            <div className="flex items-center gap-2 text-[32px] font-extrabold text-[var(--color-primary-400)]">
              {promedio.calificacion_promedio}
              <span aria-hidden="true" className="text-yellow-400">★</span>
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
                {resenas.resenas.map(r => (
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
          </div>
        </div>
      </div>
    </div>
  );
}