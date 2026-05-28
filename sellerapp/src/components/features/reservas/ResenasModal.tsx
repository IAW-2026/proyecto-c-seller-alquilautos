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

export function ResenasModal({ reserva, alquilador, id_propietario }: ResenasModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ResenasData | null>(null);
  const [nuevaResena, setNuevaResena] = useState({
    calificacionGeneral: 5,
    descripcion: "",
    calificacionComunicacion: 5,
    calificacionPuntualidad: 5,
    calificacionDevolucion: 5,
  });
  const [guardandoResena, setGuardandoResena] = useState(false);

  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);
    const result = await getResenasReservaAction(reserva.id_reserva);
    setData(result);
    if (result.resenaAlquilador.descripcion) {
      setNuevaResena({
        calificacionGeneral: result.resenaAlquilador.calificacion_general ?? 5,
        descripcion: result.resenaAlquilador.descripcion ?? "",
        calificacionComunicacion: result.resenaAlquilador.calificacion_comunicacion ?? 5,
        calificacionPuntualidad: result.resenaAlquilador.calificacion_puntualidad ?? 5,
        calificacionDevolucion: result.resenaAlquilador.calificacion_devolucion ?? 5,
      });
    }
    setLoading(false);
  };

  const [respondido, setRespondido] = useState<{ vehiculo: boolean; propietario: boolean }>({
    vehiculo: false,
    propietario: false,
  });

  const handleResponder = async (tipo: "vehiculo" | "propietario", respuesta: string) => {
    if (!data) return;
    const id_resena = tipo === "vehiculo"
      ? String(data.resenaVehiculo.id_resena)
      : String(data.resenaPropietario.id_resena);
    await responderResenaAction({ id_resena, id_propietario, respuesta });
    setRespondido(prev => ({ ...prev, [tipo]: true }));
  };

  const [reseñaEnviada, setReseñaEnviada] = useState(false);

  const handleGuardarResena = async () => {
    setGuardandoResena(true);
    await crearResenaAction({
      idReserva: reserva.id_reserva,
      idEmisor: id_propietario,
      idAlquilador: reserva.id_alquilador,
      ...nuevaResena,
    });
    setReseñaEnviada(true);
    setGuardandoResena(false);
  };

  const yaReseno = !!data?.resenaAlquilador.descripcion;

  return (
    <>
      <button className="btn secondary sm" onClick={handleOpen}>Ver reseñas</button>
      <DetalleModal open={open} onClose={() => setOpen(false)} title={`Reseñas de ${alquilador ? `${alquilador.nombre} ${alquilador.apellido}` : reserva.id_alquilador}`}>
        {loading || !data ? (
          <div style={{ textAlign: "center", padding: 32, color: "var(--text-secondary)" }}>Cargando reseñas...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "var(--text-secondary)", marginBottom: 12 }}>LO QUE DIJO EL ALQUILADOR</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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

            <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "var(--text-secondary)", marginBottom: 12 }}>
                TU RESEÑA SOBRE {alquilador ? alquilador.nombre.toUpperCase() : "EL ALQUILADOR"}
              </div>
              <div style={{ background: "var(--surface-raised)", borderRadius: "var(--radius-md)", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "CALIFICACIÓN GENERAL", field: "calificacionGeneral" as const },
                  { label: "COMUNICACIÓN", field: "calificacionComunicacion" as const },
                  { label: "PUNTUALIDAD", field: "calificacionPuntualidad" as const },
                  { label: "DEVOLUCIÓN", field: "calificacionDevolucion" as const },
                ].map(({ label, field }) => (
                  <div key={field} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)" }}>{label}</label>
                    <Estrellas valor={nuevaResena[field]} onChange={yaReseno || reseñaEnviada ? undefined : v => setNuevaResena(p => ({ ...p, [field]: v }))} />
                  </div>
                ))}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)" }}>DESCRIPCIÓN</label>
                  <textarea
                    value={nuevaResena.descripcion}
                    onChange={e => !(yaReseno || reseñaEnviada) && setNuevaResena(p => ({ ...p, descripcion: e.target.value }))}
                    readOnly={yaReseno || reseñaEnviada}
                    placeholder="Escribí tu reseña..."
                    style={{ width: "100%", minHeight: 80, padding: 8, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-default)", background: "var(--surface-base)", color: "var(--text-primary)", fontSize: 13, resize: "vertical", opacity: yaReseno || reseñaEnviada ? 0.7 : 1 }}
                  />
                </div>
                {yaReseno || reseñaEnviada ? (
                  <div style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>
                    ✓ Reseña enviada
                  </div>
                ) : (
                  <button
                    className="btn primary sm"
                    style={{ alignSelf: "flex-end" }}
                    onClick={handleGuardarResena}
                    disabled={guardandoResena || !nuevaResena.descripcion}
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