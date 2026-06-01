"use client";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/Modal";
import { eliminarPropietarioAction } from "@/lib/actions/admin.actions";

interface EliminarPropietarioButtonProps {
  id_propietario: string;
  nombre: string;
}

export function EliminarPropietarioButton({ id_propietario, nombre }: EliminarPropietarioButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setLoading(true);
    const result = await eliminarPropietarioAction(id_propietario);
    setLoading(false);
    if (result.error) { setError(result.error); setOpen(false); return; }
    setOpen(false);
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
        className="inline-flex items-center justify-center px-[10px] py-[6px] rounded-[var(--radius-md)] text-[12px] font-semibold bg-[var(--color-danger-500)] text-white hover:bg-[var(--color-danger-700)] transition-colors duration-[180ms]"
      >
        Eliminar
      </button>
      <ConfirmModal
        open={open}
        title="¿Eliminar propietario?"
        message={`Se eliminará a ${nombre} junto con todos sus vehículos y reservas inactivas.`}
        confirmLabel={loading ? "Eliminando..." : "Eliminar"}
        confirmVariant="danger"
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}