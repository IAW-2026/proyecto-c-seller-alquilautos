"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { Reserva } from "@/lib/types";

interface ReservasActionsProps {
  reserva: Reserva;
}

export default function ReservasActions({ reserva }: ReservasActionsProps) {
  const router = useRouter();
  const [confirm, setConfirm] = useState<"Aceptada" | "Rechazada" | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, showToast] = useToast();

  const handleConfirm = async () => {
    if (!confirm) return;
    setLoading(true);

    const res = await fetch(`/api/reserva/${reserva.id_reserva}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: confirm }),
    });

    setLoading(false);
    setConfirm(null);

    if (res.ok) {
      showToast(confirm === "Aceptada" ? "✓ Reserva aceptada" : "Reserva rechazada");
      router.refresh();
    }
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