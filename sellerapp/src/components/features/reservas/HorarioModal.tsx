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

export function HorarioModal({ open, onCancel, onConfirm }: HorarioModalProps) {
  const [horario, setHorario] = useState({
    hora_inicio_entrega: "",
    hora_fin_entrega: "",
    hora_inicio_devolucion: "",
    hora_fin_devolucion: "",
  });

  const isValid = Object.values(horario).every(v => v !== "");

  const handleChange = (field: keyof typeof horario) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setHorario(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <DetalleModal open={open} onClose={onCancel} title="Definir franja horaria">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="form-grid">
          <div className="field">
            <label>Entrega — desde</label>
            <input type="time" value={horario.hora_inicio_entrega} onChange={handleChange("hora_inicio_entrega")} />
          </div>
          <div className="field">
            <label>Entrega — hasta</label>
            <input type="time" value={horario.hora_fin_entrega} onChange={handleChange("hora_fin_entrega")} />
          </div>
          <div className="field">
            <label>Devolución — desde</label>
            <input type="time" value={horario.hora_inicio_devolucion} onChange={handleChange("hora_inicio_devolucion")} />
          </div>
          <div className="field">
            <label>Devolución — hasta</label>
            <input type="time" value={horario.hora_fin_devolucion} onChange={handleChange("hora_fin_devolucion")} />
          </div>
        </div>
        <div className="actions">
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button variant="primary" onClick={() => onConfirm(horario)} disabled={!isValid}>
            Confirmar y aceptar
          </Button>
        </div>
      </div>
    </DetalleModal>
  );
}