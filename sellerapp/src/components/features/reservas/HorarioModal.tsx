"use client";
import { useState } from "react";
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
const inputClass = "border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] px-3 py-[10px] rounded-[var(--radius-md)] text-[14px] outline-none transition-[border-color,box-shadow] duration-[180ms] focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary-400)_18%,transparent)]";

export function HorarioModal({ open, onCancel, onConfirm }: HorarioModalProps) {
  const [horario, setHorario] = useState({
    hora_inicio_entrega:    "",
    hora_fin_entrega:       "",
    hora_inicio_devolucion: "",
    hora_fin_devolucion:    "",
  });

  const isValid = Object.values(horario).every(v => v !== "");
  const handleChange = (field: keyof typeof horario) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setHorario(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <DetalleModal open={open} onClose={onCancel} title="Definir franja horaria">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-x-5 gap-y-[18px] max-[700px]:grid-cols-1">
          <div className={fieldClass}>
            <label className={labelClass}>Entrega — desde</label>
            <input type="time" value={horario.hora_inicio_entrega} onChange={handleChange("hora_inicio_entrega")} className={inputClass} />
          </div>
          <div className={fieldClass}>
            <label className={labelClass}>Entrega — hasta</label>
            <input type="time" value={horario.hora_fin_entrega} onChange={handleChange("hora_fin_entrega")} className={inputClass} />
          </div>
          <div className={fieldClass}>
            <label className={labelClass}>Devolución — desde</label>
            <input type="time" value={horario.hora_inicio_devolucion} onChange={handleChange("hora_inicio_devolucion")} className={inputClass} />
          </div>
          <div className={fieldClass}>
            <label className={labelClass}>Devolución — hasta</label>
            <input type="time" value={horario.hora_fin_devolucion} onChange={handleChange("hora_fin_devolucion")} className={inputClass} />
          </div>
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