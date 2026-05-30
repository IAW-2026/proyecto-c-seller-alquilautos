interface BadgeProps {
  tone?: "neutral" | "success" | "danger" | "accent" | "info";
  withDot?: boolean;
  children: React.ReactNode;
}

export function Badge({ tone = "neutral", withDot = false, children }: BadgeProps) {
  return (
    <span className={"badge " + tone}>
      {withDot && <span className="dot" />}
      {children}
    </span>
  );
}

export function StatusBadge({ estado }: { estado: string }) {
  if (estado === "Disponible")  return <Badge tone="success" withDot>Disponible</Badge>;
  if (estado === "Alquilado")   return <Badge tone="danger" withDot>Alquilado</Badge>;
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