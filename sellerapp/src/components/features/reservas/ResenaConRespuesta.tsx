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

export function ResenaConRespuesta({ titulo, calificacion, descripcion, respuesta, respondido, onResponder }: ResenaConRespuestaProps) {
  const [respondiendo, setRespondiendo] = useState(false);
  const [texto, setTexto] = useState("");

  const handleEnviar = async () => {
    await onResponder(texto);
    setRespondiendo(false);
    setTexto("");
  };

  return (
    <div className="bg-[var(--bg-elevated)] rounded-[var(--radius-md)] p-4 flex flex-col gap-2">
      <div className="text-[11px] font-bold text-[var(--text-secondary)] tracking-wide">{titulo}</div>
      <Estrellas valor={calificacion} />
      <div className="text-[14px] text-[var(--text-primary)]">{descripcion}</div>

      {respuesta || respondido ? (
        <div className="text-[12px] text-[#22c55e] font-semibold">✓ Respuesta enviada</div>
      ) : respondiendo ? (
        <div className="flex flex-col gap-2 mt-1">
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="Escribí tu respuesta..."
            className={textareaClass}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setRespondiendo(false)}
              className="inline-flex items-center justify-center px-[10px] py-[6px] rounded-[var(--radius-md)] text-[12px] font-semibold bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-[background] duration-[180ms] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleEnviar}
              disabled={!texto}
              className="inline-flex items-center justify-center px-[10px] py-[6px] rounded-[var(--radius-md)] text-[12px] font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-bg-hover)] transition-[background] duration-[180ms] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setRespondiendo(true)}
          className="self-start inline-flex items-center justify-center px-[10px] py-[6px] rounded-[var(--radius-md)] text-[12px] font-semibold bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-[background] duration-[180ms] cursor-pointer"
        >
          ✏ Responder
        </button>
      )}
    </div>
  );
}