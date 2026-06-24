"use client";
import { useEffect, useRef, useState } from "react";
import { DetalleModal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface HorarioModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (horario: {
    hora_inicio_entrega: string;
    hora_fin_entrega: string;
    hora_inicio_devolucion: string;
    hora_fin_devolucion: string;
  }) => void;
}

const fieldClass = "flex flex-col gap-[6px]";
const labelClass = "text-[12px] font-semibold text-[var(--text-secondary)]";

const HORAS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`);

function HoraSelector({
  label,
  value,
  onSelect,
}: {
  label: string;
  value: string;
  onSelect: (hora: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className={`${fieldClass} relative`} ref={ref}>
      <label className={labelClass}>{label}</label>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center justify-between border bg-[var(--bg-surface)] text-[14px] px-3 py-[10px] rounded-[var(--radius-md)] cursor-pointer transition-[border-color] duration-[180ms] ${
          open ? "border-[var(--border-focus)]" : "border-[var(--border-default)]"
        } ${value ? "text-[var(--text-primary)] font-semibold" : "text-[var(--text-secondary)]"}`}
      >
        {value ? `${value.slice(0, 2)}:00` : "Seleccionar hora"}
        <span className={`text-[10px] transition-transform duration-[180ms] ${open ? "rotate-180" : ""}`}>▼</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-[6px] z-10 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] p-[8px] grid grid-cols-6 gap-[6px] max-[480px]:grid-cols-4">
          {HORAS.map(hora => {
            const selected = hora === value;
            return (
              <button
                key={hora}
                type="button"
                onClick={() => { onSelect(hora); setOpen(false); }}
                className={`flex items-center justify-center px-2 py-[8px] rounded-[var(--radius-md)] text-[13px] font-semibold border transition-[border-color,background,color] duration-[180ms] cursor-pointer ${
                  selected
                    ? "bg-[var(--color-primary-500)] border-[var(--color-primary-500)] text-white"
                    : "bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                }`}
              >
                {hora.slice(0, 2)}h
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function HorarioModal({ open, onCancel, onConfirm }: HorarioModalProps) {
  const [horario, setHorario] = useState({
    hora_inicio_entrega:    "",
    hora_fin_entrega:       "",
    hora_inicio_devolucion: "",
    hora_fin_devolucion:    "",
  });

  const isValid = Object.values(horario).every(v => v !== "");
  const handleSelect = (field: keyof typeof horario) => (hora: string) =>
    setHorario(prev => ({ ...prev, [field]: hora }));

  return (
    <DetalleModal open={open} onClose={onCancel} title="Definir franja horaria">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-x-5 gap-y-[18px] max-[480px]:grid-cols-1">
          <HoraSelector label="Entrega — desde" value={horario.hora_inicio_entrega} onSelect={handleSelect("hora_inicio_entrega")} />
          <HoraSelector label="Entrega — hasta" value={horario.hora_fin_entrega} onSelect={handleSelect("hora_fin_entrega")} />
          <HoraSelector label="Devolución — desde" value={horario.hora_inicio_devolucion} onSelect={handleSelect("hora_inicio_devolucion")} />
          <HoraSelector label="Devolución — hasta" value={horario.hora_fin_devolucion} onSelect={handleSelect("hora_fin_devolucion")} />
        </div>
        <div className="flex justify-end gap-[10px]">
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button variant="primary" onClick={() => onConfirm(horario)} disabled={!isValid}>
            Confirmar y aceptar
          </Button>
        </div>
      </div>
    </DetalleModal>
  );
}