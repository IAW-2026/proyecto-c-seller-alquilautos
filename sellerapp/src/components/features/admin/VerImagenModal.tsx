"use client";
import { useState } from "react";
import { DetalleModal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface VerImagenModalProps {
  src: string;
  alt: string;
}

export function VerImagenModal({ src, alt }: VerImagenModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
        <Icon name="image" size={14} />
        Ver imagen
      </Button>
      <DetalleModal open={open} onClose={() => setOpen(false)} title={alt}>
        <img src={src} alt={alt} className="w-full rounded-[var(--radius-md)] object-cover" />
      </DetalleModal>
    </>
  );
}
