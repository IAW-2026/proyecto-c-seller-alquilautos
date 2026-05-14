"use client";
import { Button } from "./Button";

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
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-t">
        <h4 id="modal-t">{title}</h4>
        <p>{message}</p>
        <div className="actions">
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}