import type { EstadoReserva } from "@prisma/client";
import { Icon } from "./Icon";

interface TimelineEstadoProps {
  estado: EstadoReserva;
}

const PASOS: { estado: EstadoReserva; label: string }[] = [
  { estado: "Pendiente", label: "Pendiente" },
  { estado: "Aceptada", label: "Aceptada" },
  { estado: "Coordinada", label: "Coordinada" },
  { estado: "Pagada", label: "Pagada" },
  { estado: "Entregada", label: "Entregada" },
  { estado: "Finalizada", label: "Finalizada" },
];

const ESTADOS_INTERRUPCION: EstadoReserva[] = ["Rechazada", "Cancelada"];
// Rechazada/Cancelada no guardan en qué paso intermedio ocurrieron, así que
// el corte se muestra siempre apenas después de "Pendiente" (el único paso garantizado).
const INDICE_CORTE = 1;

const N = PASOS.length;
const SEGMENTO_PCT = 100 / N;
const INSET_PCT = SEGMENTO_PCT / 2;
const SPAN_PCT = 100 - SEGMENTO_PCT;

export function TimelineEstado({ estado }: TimelineEstadoProps) {
  const interrumpida = ESTADOS_INTERRUPCION.includes(estado);
  const indiceActual = interrumpida ? -1 : PASOS.findIndex(p => p.estado === estado);
  const indiceProgreso = interrumpida ? INDICE_CORTE : indiceActual;
  const fraccion = indiceProgreso / (N - 1);
  const colorProgreso = interrumpida ? "var(--color-danger-500)" : "var(--color-success-500)";
  const esUltimoPaso = indiceActual === N - 1;

  return (
    <div
      role="list"
      aria-label="Estado de la reserva"
      className="relative flex max-[560px]:flex-col"
    >
      {/* Track horizontal (desktop) */}
      <div
        className="absolute top-[14px] h-[2px] bg-[var(--border-default)] max-[560px]:hidden"
        style={{ left: `${INSET_PCT}%`, right: `${INSET_PCT}%` }}
      />
      <div
        className="absolute top-[14px] h-[2px] transition-[width] duration-300 max-[560px]:hidden"
        style={{ left: `${INSET_PCT}%`, width: `${SPAN_PCT * fraccion}%`, background: colorProgreso }}
      />

      {/* Track vertical (mobile) */}
      <div
        className="hidden max-[560px]:block absolute left-[14px] w-[2px] bg-[var(--border-default)]"
        style={{ top: `${INSET_PCT}%`, bottom: `${INSET_PCT}%` }}
      />
      <div
        className="hidden max-[560px]:block absolute left-[14px] w-[2px] transition-[height] duration-300"
        style={{ top: `${INSET_PCT}%`, height: `${SPAN_PCT * fraccion}%`, background: colorProgreso }}
      />

      {PASOS.map((paso, i) => {
        const completado = interrumpida
          ? i < INDICE_CORTE
          : i < indiceActual || (esUltimoPaso && i === indiceActual);
        const actual = !interrumpida && i === indiceActual && !esUltimoPaso;
        const cortado = interrumpida && i === INDICE_CORTE;
        const futuro = !completado && !actual && !cortado;
        const label = cortado ? estado : paso.label;

        return (
          <div
            key={paso.estado}
            role="listitem"
            className="relative z-10 flex flex-1 flex-col items-center gap-2 min-w-0 max-[560px]:flex-row max-[560px]:flex-none max-[560px]:items-center max-[560px]:gap-3 max-[560px]:min-h-[40px] max-[560px]:w-full"
          >
            <div
              className={[
                "w-[28px] h-[28px] shrink-0 rounded-[var(--radius-full)] grid place-items-center border-2",
                completado && "bg-[var(--color-success-500)] border-[var(--color-success-500)] text-white",
                actual && "bg-[var(--color-primary-400)] border-[var(--color-primary-400)] text-white animate-[pulse_1.6s_ease-out_infinite]",
                cortado && "bg-[var(--color-danger-500)] border-[var(--color-danger-500)] text-white",
                futuro && "bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-tertiary)]",
              ].filter(Boolean).join(" ")}
              style={actual ? ({ "--pulse-color": "var(--color-primary-400)" } as React.CSSProperties) : undefined}
            >
              {completado && <Icon name="check" size={14} aria-hidden="true" />}
              {cortado && <Icon name="x" size={14} aria-hidden="true" />}
            </div>
            <span
              className={[
                "text-[12px] font-semibold text-center max-[560px]:text-left",
                completado && "text-[var(--color-success-500)]",
                actual && "text-[var(--color-primary-400)]",
                cortado && "text-[var(--color-danger-500)]",
                futuro && "text-[var(--text-tertiary)]",
              ].filter(Boolean).join(" ")}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
