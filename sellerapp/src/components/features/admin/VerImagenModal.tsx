"use client";
import { useState } from "react";
import { DetalleModal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface VerImagenModalProps {
  src: string;
  alt: string;
  variant?: "button" | "cover";
}

export function VerImagenModal({ src, alt, variant = "button" }: VerImagenModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === "cover" ? (
        <button
          onClick={() => setOpen(true)}
          aria-label={`Ver imagen de ${alt}`}
          className="group absolute inset-0 w-full h-full cursor-pointer"
          style={{ backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <span className="absolute inset-0 bg-black/45 group-hover:bg-black/60 transition-colors duration-[180ms] flex items-center justify-center">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/15 border border-white/40 text-white backdrop-blur-sm group-hover:scale-110 transition-transform duration-[180ms]">
              <Icon name="expand" size={18} />
            </span>
          </span>
        </button>
      ) : (
        <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
          <Icon name="image" size={14} />
          Ver imagen
        </Button>
      )}
      <DetalleModal open={open} onClose={() => setOpen(false)} title={alt}>
        <img src={src} alt={alt} className="w-full rounded-[var(--radius-md)] object-cover" />
      </DetalleModal>
    </>
  );
}
