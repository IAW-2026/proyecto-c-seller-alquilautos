"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/Modal";
import { HorarioModal } from "./HorarioModal";
import { useToast } from "@/components/ui/Toast";
import { aceptarReservaAction, rechazarReservaAction } from "@/lib/actions/reserva.actions";
import type { Reserva } from "@/lib/types";

interface ReservasActionsProps {
  reserva: Reserva;
  monto_pagar: number;
  vehiculo?: { marca: string; modelo: string };
}

export default function ReservasActions({ reserva, monto_pagar, vehiculo }: ReservasActionsProps) {
  const [step, setStep]       = useState<"idle" | "horario" | "rechazar">("idle");
  const [loading, setLoading] = useState(false);
  const [toast, showToast]    = useToast();

  const handleAceptar = async (horario: {
    hora_inicio_entrega: string;
    hora_fin_entrega: string;
    hora_inicio_devolucion: string;
    hora_fin_devolucion: string;
  }) => {
    setLoading(true);
    try {
      await aceptarReservaAction(
        reserva.id_reserva,
        horario,
        monto_pagar,
        reserva.id_alquilador,
        reserva.id_propietario,
        reserva.id_vehiculo
      );
      showToast("✓ Reserva aceptada");
    } catch (error) {
      console.error(error);
      showToast("Error al aceptar la reserva");
    }
    setLoading(false);
    setStep("idle");
  };

  const handleRechazar = async () => {
    setLoading(true);
    try {
      await rechazarReservaAction(reserva.id_reserva);
      showToast("Reserva rechazada");
    } catch (error) {
      console.error(error);
      showToast("Error al rechazar la reserva");
    }
    setLoading(false);
    setStep("idle");
  };

  return (
    <>
      {toast}
      <div className="flex items-center justify-end gap-[10px]">
        <button
          onClick={() => setStep("rechazar")}
          className="inline-flex items-center justify-center px-[10px] py-[6px] rounded-[var(--radius-md)] text-[12px] font-semibold bg-transparent text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-[background] duration-[180ms] cursor-pointer"
        >
          Rechazar
        </button>
        <Button variant="primary" size="sm" onClick={() => setStep("horario")}>
          Aceptar
        </Button>
      </div>

      <HorarioModal
        open={step === "horario"}
        onCancel={() => setStep("idle")}
        onConfirm={handleAceptar}
      />

      <ConfirmModal
        open={step === "rechazar"}
        title="¿Rechazar esta reserva?"
        message={`Reserva del vehículo ${vehiculo ? `${vehiculo.marca} ${vehiculo.modelo}` : reserva.id_vehiculo}`}
        confirmLabel="Rechazar"
        confirmVariant="danger"
        onConfirm={handleRechazar}
        onCancel={() => setStep("idle")}
      />
    </>
  );
}