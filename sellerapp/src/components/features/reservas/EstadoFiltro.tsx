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

  return (
    <div style={{ position: "relative" }}>
      <button
        className="btn secondary"
        onClick={() => setOpen(prev => !prev)}
        style={{ display: "flex", alignItems: "center", gap: 8 }}
      >
        {estadoActual || "Todos"}
        <span style={{ fontSize: 10 }}>▼</span>
      </button>
      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 10 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", right: 0,
            background: "var(--bg-surface)", border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)",
            zIndex: 20, minWidth: 160, overflow: "hidden",
          }}>
            {ESTADOS.map(e => (
              <button
                key={e}
                onClick={() => handleSelect(e)}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "10px 14px", border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: (estadoActual === e || (!estadoActual && e === "Todos")) ? 700 : 400,
                  background: (estadoActual === e || (!estadoActual && e === "Todos")) ? "var(--color-primary-400)" : "transparent",
                  color: (estadoActual === e || (!estadoActual && e === "Todos")) ? "white" : "var(--text-primary)",
                }}
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