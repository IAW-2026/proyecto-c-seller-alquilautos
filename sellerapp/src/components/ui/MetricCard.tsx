interface MetricCardProps {
  label: string;
  value: string | number;
  foot?: string;
  variant?: "primary" | "alert";
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const base = "relative overflow-hidden min-h-[142px] flex flex-col gap-[6px] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-[20px_22px] shadow-[var(--shadow-sm)] min-w-0 break-words";

const variants = {
  primary: "bg-[var(--btn-primary-bg)] border-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]",
  alert:   "border-[color-mix(in_srgb,var(--color-accent-400)_50%,transparent)] bg-[color-mix(in_srgb,var(--color-accent-400)_8%,var(--bg-surface))]",
};

export function MetricCard({ label, value, foot, variant, icon, children }: MetricCardProps) {
  return (
    <div className={[base, variant ? variants[variant] : ""].filter(Boolean).join(" ")}>
      <div className={[
        "text-[13px]",
        variant === "primary" ? "text-[rgba(255,255,255,0.85)]" : "text-[var(--text-secondary)]",
      ].join(" ")}>
        {label}
      </div>
      <div className="text-[30px] font-bold tracking-[-0.02em]">{value}</div>
      {children}
      {foot && (
        <div className={[
          "mt-auto text-[12px]",
          variant === "primary" ? "text-[rgba(255,255,255,0.85)]" : "text-[var(--text-secondary)]",
        ].join(" ")}>
          {foot}
        </div>
      )}
      {variant === "primary" && icon}
    </div>
  );
}