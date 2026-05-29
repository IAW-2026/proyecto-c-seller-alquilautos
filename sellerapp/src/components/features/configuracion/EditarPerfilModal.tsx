"use client";
import { useState } from "react";
import { DetalleModal } from "@/components/ui/Modal";
import { ConfiguracionForm } from "./ConfiguracionForm";
import type { Propietario } from "@/lib/types";

interface EditarPerfilModalProps {
  propietario: Propietario;
}

export function EditarPerfilModal({ propietario }: EditarPerfilModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="btn primary" onClick={() => setOpen(true)}>
        Editar perfil
      </button>
      <DetalleModal
        open={open}
        onClose={() => setOpen(false)}
        title="Editar perfil"
      >
        <ConfiguracionForm propietario={propietario} onSuccess={() => setOpen(false)} />
      </DetalleModal>
    </>
  );
}