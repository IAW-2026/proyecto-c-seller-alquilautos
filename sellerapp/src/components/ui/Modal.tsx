"use client";
import { Button } from "./Button";
import { useEffect } from "react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: "primary" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ open, title, message, confirmLabel = "Confirmar", confirmVariant = "primary", onConfirm, onCancel }: ConfirmModalProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-[rgba(15,23,42,0.55)] grid place-items-center z-[100] p-5 animate-[fadeIn_160ms_ease]"
      onClick={onCancel}
    >
      <div
        className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] p-6 max-w-[420px] w-full shadow-[var(--shadow-lg)] animate-[slideUp_200ms_ease]"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-t"
      >
        <h4 className="m-0 mb-[6px] text-[17px] font-bold text-[var(--text-primary)]" id="modal-t">{title}</h4>
        <p className="m-0 mb-[18px] text-[var(--text-secondary)] text-[13px]">{message}</p>
        <div className="flex justify-end gap-[10px]">
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

interface DetalleModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function DetalleModal({ open, onClose, title, children }: DetalleModalProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-[rgba(15,23,42,0.55)] grid place-items-center z-[100] p-5 animate-[fadeIn_160ms_ease]"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] p-6 max-w-[560px] w-full shadow-[var(--shadow-lg)] animate-[slideUp_200ms_ease]"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-center mb-4">
          <h4 className="m-0 text-[17px] font-bold text-[var(--text-primary)]">{title}</h4>
          <button
            onClick={onClose}
            className="bg-transparent border-none cursor-pointer text-[var(--text-secondary)] text-[18px] leading-none hover:text-[var(--text-primary)] transition-colors duration-[180ms]"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}