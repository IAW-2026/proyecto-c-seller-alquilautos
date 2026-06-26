import React from "react";

interface BadgeProps {
  tone?: "neutral" | "success" | "danger" | "accent" | "info";
  withDot?: boolean;
  children: React.ReactNode;
}

const base = "inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-[var(--radius-full)] text-[11px] font-semibold border border-transparent";

const tones = {
  neutral: "bg-[var(--color-neutral-100)] text-[var(--text-secondary)] border-[var(--border-default)]",
  success: "bg-[var(--status-available-bg)] text-[var(--status-available-text)] border-[var(--status-available-border)]",
  danger:  "bg-[var(--status-unavailable-bg)] text-[var(--status-unavailable-text)] border-[var(--status-unavailable-border)]",
  accent:  "bg-[var(--badge-pendiente-bg)] text-[var(--badge-pendiente-text)] border-[var(--badge-pendiente-border)]",
  info:    "bg-[#DBEAFE] text-[#1E40AF] border-[#93C5FD]",
};

export function Badge({ tone = "neutral", withDot = false, children }: BadgeProps) {
  return (
    <span className={[base, tones[tone]].join(" ")}>
      {withDot && (
        <span className="w-[6px] h-[6px] rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ estado }: { estado: string }) {
  if (estado === "Disponible")  return <Badge tone="success" withDot>Disponible</Badge>;
  if (estado === "Alquilado")   return <Badge tone="danger"  withDot>Alquilado</Badge>;
  if (estado === "Pendiente")   return <Badge tone="accent">Pendiente</Badge>;
  if (estado === "Aceptada")    return <Badge tone="success">Aceptada</Badge>;
  if (estado === "Rechazada")   return <Badge tone="danger">Rechazada</Badge>;
  if (estado === "Coordinada")  return <Badge tone="info">Coordinada</Badge>;
  if (estado === "Pagada")      return <Badge tone="info">Pagada</Badge>;
  if (estado === "Entregada")   return <Badge tone="info">Entregada</Badge>;
  if (estado === "Finalizada")  return <Badge tone="success">Finalizada</Badge>;
  if (estado === "Cancelada")   return <Badge tone="danger">Cancelada</Badge>;
  return <Badge>{estado}</Badge>;
}