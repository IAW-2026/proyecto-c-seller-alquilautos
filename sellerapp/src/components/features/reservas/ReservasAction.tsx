"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { aceptarReservaAction, rechazarReservaAction } from "@/lib/actions/reserva.actions";
import type { Reserva } from "@/lib/types";

interface ReservasActionsProps {
  reserva: Reserva;
}

export default function ReservasActions({ reserva }: ReservasActionsProps) {
  const [confirm, setConfirm] = useState<"Aceptada" | "Rechazada" | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, showToast] = useToast();

  const handleConfirm = async () => {
    if (!confirm) return;
    setLoading(true);
    try {
      if (confirm === "Aceptada") {
        await aceptarReservaAction(reserva.id_reserva);
        showToast("✓ Reserva aceptada");
      } else {
        await rechazarReservaAction(reserva.id_reserva);
        showToast("Reserva rechazada");
      }
    } catch (e) {
      showToast("Error al actualizar la reserva");
    }
    setLoading(false);
    setConfirm(null);
  };

  return (
    <>
      {toast}
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <Button variant="secondary" size="sm" onClick={() => setConfirm("Rechazada")}>
          Rechazar
        </Button>
        <Button variant="primary" size="sm" onClick={() => setConfirm("Aceptada")}>
          Aceptar
        </Button>
      </div>
      <ConfirmModal
        open={!!confirm}
        title={confirm === "Aceptada" ? "¿Aceptar esta reserva?" : "¿Rechazar esta reserva?"}
        message={`Reserva del vehículo ${reserva.id_vehiculo}`}
        confirmLabel={confirm === "Aceptada" ? "Aceptar" : "Rechazar"}
        confirmVariant={confirm === "Aceptada" ? "primary" : "danger"}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}