import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "excel" | "pdf";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

function Spinner() {
  return (
    <svg className="animate-spin h-[14px] w-[14px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

const base =
  "inline-flex items-center justify-center gap-2 border border-transparent rounded-[var(--radius-md)] text-[13px] font-semibold cursor-pointer transition-[background,color,border-color,box-shadow] duration-[180ms] ease-linear whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)] disabled:opacity-50 disabled:cursor-not-allowed";

const variants = {
  primary:   "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-bg-hover)]",
  secondary: "bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-default)] hover:bg-[var(--bg-hover)]",
  ghost:     "bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
  danger:    "bg-[var(--color-danger-500)] text-white hover:bg-[var(--color-danger-700)]",
  excel:     "bg-[#1D6F42] text-white hover:bg-[#185c36]",
  pdf:       "bg-[#C8102E] text-white hover:bg-[#a30d26]",
};

const sizes = {
  sm: "px-[10px] py-[6px] text-[12px]",
  md: "px-[16px] py-[9px]",
  lg: "px-[20px] py-[12px] text-[14px]",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={[base, variants[variant], sizes[size], className].filter(Boolean).join(" ")}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}