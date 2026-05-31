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

const textareaClass = "w-full min-h-[80px] px-2 py-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-[13px] resize-vertical outline-none focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary-400)_18%,transparent)] transition-[border-color,box-shadow] duration-[180ms]";
const btnSecondary  = "inline-flex items-center gap-1 px-3 py-[6px] rounded-[var(--radius-md)] text-[12px] font-semibold bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-[background] duration-[180ms] cursor-pointer";
const btnPrimary    = "inline-flex items-center gap-1 px-3 py-[6px] rounded-[var(--radius-md)] text-[12px] font-semibold bg-[var(--btn-primary-bg)] !text-white hover:bg-[var(--btn-primary-bg-hover)] transition-[background] duration-[180ms] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

export function ResenaConRespuesta({ titulo, calificacion, descripcion, respuesta, respondido, onResponder }: ResenaConRespuestaProps) {
  const [respondiendo, setRespondiendo] = useState(false);
  const [texto, setTexto] = useState("");

  const handleEnviar = async () => {
    await onResponder(texto);
    setRespondiendo(false);
    setTexto("");
  };

  return (
    <div className="py-3 border-b border-[var(--border-default)] last:border-b-0">
      {/* Header: label a la derecha */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col gap-1">
          <Estrellas valor={calificacion} />
          <div className="text-[14px] font-semibold text-[var(--text-primary)]">{descripcion}</div>
        </div>
        <div className="flex flex-col items-end gap-2 ml-4 shrink-0">
          <span className="text-[11px] font-bold tracking-[0.05em] text-[var(--text-secondary)]">{titulo}</span>
          {respuesta || respondido ? (
            <div className="text-[12px] text-[#22c55e] font-semibold flex items-center gap-1">
              <span>✓</span> Respuesta enviada
            </div>
          ) : respondiendo ? null : (
            <button onClick={() => setRespondiendo(true)} className={btnSecondary}>
              ↩ Responder
            </button>
          )}
        </div>
      </div>

      {/* Textarea de respuesta */}
      {respondiendo && (
        <div className="flex flex-col gap-2 mt-2">
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="Escribí tu respuesta..."
            className={textareaClass}
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setRespondiendo(false)} className={btnSecondary}>Cancelar</button>
            <button onClick={handleEnviar} disabled={!texto} className={btnPrimary}>Enviar</button>
          </div>
        </div>
      )}
    </div>
  );
}