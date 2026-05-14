interface MetricCardProps {
  label: string;
  value: string | number;
  foot?: string;
  variant?: "primary" | "alert";
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function MetricCard({ label, value, foot, variant, icon, children }: MetricCardProps) {
  return (
    <div className={"metric-card" + (variant ? " " + variant : "")}>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {children}
      {foot && <div className="foot">{foot}</div>}
      {variant === "primary" && icon}
    </div>
  );
}