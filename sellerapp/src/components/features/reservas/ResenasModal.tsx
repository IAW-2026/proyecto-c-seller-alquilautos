"use client";
import { useState } from "react";
import { DetalleModal } from "@/components/ui/Modal";
import { Estrellas } from "@/components/ui/Estrellas";
import { ResenaConRespuesta } from "./ResenaConRespuesta";
import { getResenasReservaAction, responderResenaAction, crearResenaAction } from "@/lib/actions/feedback.actions";
import type { Reserva } from "@/lib/types";

interface Alquilador {
  id_alquilador: string;
  nombre: string;
  apellido: string;
  email: string;
}

interface ResenasModalProps {
  reserva: Reserva;
  alquilador?: Alquilador;
  id_propietario: string;
}

type ResenasData = Awaited<ReturnType<typeof getResenasReservaAction>>;

const sectionLabelClass = "text-[11px] font-bold tracking-[0.05em] text-[var(--text-secondary)] mb-3";
const fieldClass        = "flex flex-col gap-[6px]";
const labelClass        = "text-[11px] font-bold text-[var(--text-secondary)]";
const textareaClass     = "w-full min-h-[80px] px-2 py-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-[13px] resize-vertical outline-none focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary-400)_18%,transparent)] transition-[border-color,box-shadow] duration-[180ms]";

export function ResenasModal({ reserva, alquilador, id_propietario }: ResenasModalProps) {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData]       = useState<ResenasData | null>(null);
  const [nuevaResena, setNuevaResena] = useState({
    calificacionGeneral:       5,
    descripcion:               "",
    calificacionComunicacion:  5,
    calificacionPuntualidad:   5,
    calificacionDevolucion:    5,
  });
  const [guardandoResena, setGuardandoResena] = useState(false);
  const [reseñaEnviada, setReseñaEnviada]     = useState(false);
  const [respondido, setRespondido] = useState<{ vehiculo: boolean; propietario: boolean }>({
    vehiculo: false, propietario: false,
  });

  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);
    const result = await getResenasReservaAction(reserva.id_reserva);
    setData(result);
    if (result.resenaAlquilador.descripcion) {
      setNuevaResena({
        calificacionGeneral:      result.resenaAlquilador.calificacion_general      ?? 5,
        descripcion:              result.resenaAlquilador.descripcion               ?? "",
        calificacionComunicacion: result.resenaAlquilador.calificacion_comunicacion ?? 5,
        calificacionPuntualidad:  result.resenaAlquilador.calificacion_puntualidad  ?? 5,
        calificacionDevolucion:   result.resenaAlquilador.calificacion_devolucion   ?? 5,
      });
    }
    setLoading(false);
  };

  const handleResponder = async (tipo: "vehiculo" | "propietario", respuesta: string) => {
    if (!data) return;
    const id_resena = tipo === "vehiculo"
      ? String(data.resenaVehiculo.id_resena)
      : String(data.resenaPropietario.id_resena);
    await responderResenaAction({ id_resena, id_propietario, respuesta });
    setRespondido(prev => ({ ...prev, [tipo]: true }));
  };

  const handleGuardarResena = async () => {
    setGuardandoResena(true);
    await crearResenaAction({
      idReserva:   reserva.id_reserva,
      idEmisor:    id_propietario,
      idAlquilador: reserva.id_alquilador,
      ...nuevaResena,
    });
    setReseñaEnviada(true);
    setGuardandoResena(false);
  };

  const yaReseno = !!data?.resenaAlquilador.descripcion;
  const readonly = yaReseno || reseñaEnviada;

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center justify-center px-[10px] py-[6px] rounded-[var(--radius-md)] text-[12px] font-semibold bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-[background] duration-[180ms] cursor-pointer"
      >
        Ver reseñas
      </button>

      <DetalleModal
        open={open}
        onClose={() => setOpen(false)}
        title={`Reseñas de ${alquilador ? `${alquilador.nombre} ${alquilador.apellido}` : reserva.id_alquilador}`}
      >
        {loading || !data ? (
          <div className="text-center py-8 text-[var(--text-secondary)]">Cargando reseñas...</div>
        ) : (
          <div className="flex flex-col gap-5">

            {/* Lo que dijo el alquilador */}
            <div>
              <div className={sectionLabelClass}>LO QUE DIJO EL ALQUILADOR</div>
              <div className="flex flex-col gap-2">
                <ResenaConRespuesta
                  titulo="SOBRE EL VEHÍCULO"
                  calificacion={data.resenaVehiculo.calificacion_general}
                  descripcion={data.resenaVehiculo.descripcion}
                  respuesta={data.resenaVehiculo.respuesta}
                  respondido={respondido.vehiculo}
                  onResponder={r => handleResponder("vehiculo", r)}
                />
                <ResenaConRespuesta
                  titulo="SOBRE EL PROPIETARIO"
                  calificacion={data.resenaPropietario.calificacion_general}
                  descripcion={data.resenaPropietario.descripcion}
                  respuesta={data.resenaPropietario.respuesta}
                  respondido={respondido.propietario}
                  onResponder={r => handleResponder("propietario", r)}
                />
              </div>
            </div>

            {/* Tu reseña */}
            <div className="border-t border-[var(--border-default)] pt-4">
              <div className={sectionLabelClass}>
                TU RESEÑA SOBRE {alquilador ? alquilador.nombre.toUpperCase() : "EL ALQUILADOR"}
              </div>
              <div className="bg-[var(--bg-elevated)] rounded-[var(--radius-md)] p-4 flex flex-col gap-3">
                {([
                  { label: "CALIFICACIÓN GENERAL",  field: "calificacionGeneral"      },
                  { label: "COMUNICACIÓN",           field: "calificacionComunicacion" },
                  { label: "PUNTUALIDAD",            field: "calificacionPuntualidad"  },
                  { label: "DEVOLUCIÓN",             field: "calificacionDevolucion"   },
                ] as const).map(({ label, field }) => (
                  <div key={field} className={fieldClass}>
                    <label className={labelClass}>{label}</label>
                    <Estrellas
                      valor={nuevaResena[field]}
                      onChange={readonly ? undefined : v => setNuevaResena(p => ({ ...p, [field]: v }))}
                    />
                  </div>
                ))}

                <div className={fieldClass}>
                  <label className={labelClass}>DESCRIPCIÓN</label>
                  <textarea
                    value={nuevaResena.descripcion}
                    onChange={e => !readonly && setNuevaResena(p => ({ ...p, descripcion: e.target.value }))}
                    readOnly={readonly}
                    placeholder="Escribí tu reseña..."
                    className={[textareaClass, readonly ? "opacity-70" : ""].join(" ")}
                  />
                </div>

                {readonly ? (
                  <div className="text-[12px] text-[#22c55e] font-semibold">✓ Reseña enviada</div>
                ) : (
                  <button
                    onClick={handleGuardarResena}
                    disabled={guardandoResena || !nuevaResena.descripcion}
                    className="self-end inline-flex items-center justify-center px-[10px] py-[6px] rounded-[var(--radius-md)] text-[12px] font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-bg-hover)] transition-[background] duration-[180ms] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {guardandoResena ? "Guardando..." : "Enviar reseña"}
                  </button>
                )}
              </div>
            </div>

          </div>
        )}
      </DetalleModal>
    </>
  );
}