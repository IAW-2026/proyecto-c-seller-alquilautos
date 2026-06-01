"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/ui/Modal";
import { eliminarVehiculoAction } from "@/lib/actions/vehiculo.actions";

export function EliminarVehiculoButton({ id_vehiculo, nombre }: { id_vehiculo: string; nombre: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleConfirm = async () => {
    setLoading(true);
    const result = await eliminarVehiculoAction(id_vehiculo);
    setLoading(false);
    if (result.error) { setError(result.error); setOpen(false); return; }
    router.push("/dashboard/vehiculos");
  };

  return (
    <>
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[var(--color-danger-500)] text-white px-4 py-2 rounded-[var(--radius-md)] text-[13px] z-[200]">
          {error}
        </div>
      )}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-[16px] py-[9px] rounded-[var(--radius-md)] text-[13px] font-semibold bg-[var(--color-danger-500)] text-white hover:bg-[var(--color-danger-700)] transition-colors duration-[180ms]"
      >
        Eliminar vehículo
      </button>
      <ConfirmModal
        open={open}
        title="¿Eliminar vehículo?"
        message={`Se eliminará ${nombre} junto con su historial de reservas.`}
        confirmLabel={loading ? "Eliminando..." : "Eliminar"}
        confirmVariant="danger"
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}