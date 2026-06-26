"use client";
import { useState } from "react";
import { DetalleModal } from "@/components/ui/Modal";
import { VehiculoForm } from "./VehiculoForm";
import type { Vehiculo } from "@/lib/types";

interface EditarVehiculoModalProps {
  vehiculo: Vehiculo;
}

export function EditarVehiculoModal({ vehiculo }: EditarVehiculoModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 px-[16px] py-[9px] rounded-[var(--radius-md)] text-[13px] font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-bg-hover)] transition-[background] duration-[180ms] cursor-pointer"
      >
        Editar vehículo
      </button>
      <DetalleModal
        open={open}
        onClose={() => setOpen(false)}
        title={`Editar: ${vehiculo.marca} ${vehiculo.modelo}`}
      >
        <VehiculoForm vehiculo={vehiculo} onSuccess={() => setOpen(false)} />
      </DetalleModal>
    </>
  );
}