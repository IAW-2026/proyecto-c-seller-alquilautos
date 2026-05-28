"use client";
import { useState } from "react";
import { Estrellas } from "@/components/ui/Estrellas";

interface ResenaConRespuestaProps {
  titulo: string;
  calificacion: number;
  descripcion: string;
  respuesta: string | null;
  respondido?: boolean;
  onResponder: (respuesta: string) => Promise<void>;
}

export function ResenaConRespuesta({ titulo, calificacion, descripcion, respuesta, respondido,onResponder }: ResenaConRespuestaProps) {
  const [respondiendo, setRespondiendo] = useState(false);
  const [texto, setTexto] = useState("");

  const handleEnviar = async () => {
    await onResponder(texto);
    setRespondiendo(false);
    setTexto("");
  };

  return (
    <div style={{ background: "var(--surface-raised)", borderRadius: "var(--radius-md)", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)" }}>{titulo}</div>
      <Estrellas valor={calificacion} />
      <div style={{ fontSize: 14 }}>{descripcion}</div>
      {respuesta || respondido ? (
        <div style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>
          ✓ Respuesta enviada
        </div>
      ) : respondiendo ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="Escribí tu respuesta..."
            style={{ width: "100%", minHeight: 80, padding: 8, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-default)", background: "var(--surface-base)", color: "var(--text-primary)", fontSize: 13, resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn secondary sm" onClick={() => setRespondiendo(false)}>Cancelar</button>
            <button className="btn primary sm" onClick={handleEnviar} disabled={!texto}>Enviar</button>
          </div>
        </div>
      ) : (
        <button className="btn secondary sm" style={{ alignSelf: "flex-start" }} onClick={() => setRespondiendo(true)}>
          ✏ Responder
        </button>
      )}
          </div>
        );
}