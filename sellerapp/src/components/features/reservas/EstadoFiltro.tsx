"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const ESTADOS = ["Todos", "Pendiente", "Aceptada", "Rechazada", "Coordinada", "Pagada", "Entregada", "Finalizada", "Cancelada"];

interface EstadoFiltroProps {
  estadoActual: string;
}

export function EstadoFiltro({ estadoActual }: EstadoFiltroProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSelect = (e: string) => {
    setOpen(false);
    router.push(`?estado=${e === "Todos" ? "" : e}&page=1`);
  };

  const isActive = (e: string) =>
    estadoActual === e || (!estadoActual && e === "Todos");

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="inline-flex items-center gap-2 px-[16px] py-[9px] rounded-[var(--radius-md)] text-[13px] font-semibold bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-[background] duration-[180ms] cursor-pointer"
      >
        {estadoActual || "Todos"}
        <span className="text-[10px]">▼</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-[calc(100%+6px)] right-0 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] z-20 min-w-[160px] overflow-hidden">
            {ESTADOS.map(e => (
              <button
                key={e}
                onClick={() => handleSelect(e)}
                className={[
                  "block w-full text-left px-[14px] py-[10px] border-none cursor-pointer text-[13px] transition-[background,color] duration-[180ms]",
                  isActive(e)
                    ? "bg-[var(--color-primary-400)] text-white font-bold"
                    : "bg-transparent text-[var(--text-primary)] font-normal hover:bg-[var(--bg-hover)]",
                ].join(" ")}
              >
                {e}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}