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
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 px-[16px] py-[9px] rounded-[var(--radius-md)] text-[13px] font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-bg-hover)] transition-[background] duration-[180ms] cursor-pointer"
      >
        Editar perfil
      </button>
      <DetalleModal open={open} onClose={() => setOpen(false)} title="Editar perfil">
        <ConfiguracionForm propietario={propietario} onSuccess={() => setOpen(false)} />
      </DetalleModal>
    </>
  );
}