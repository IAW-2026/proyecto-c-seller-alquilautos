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
      <button className="btn primary" onClick={() => setOpen(true)}>
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