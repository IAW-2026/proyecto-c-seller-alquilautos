import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const base =
  "inline-flex items-center justify-center gap-2 border border-transparent rounded-[var(--radius-md)] text-[13px] font-semibold cursor-pointer transition-[background,color,border-color,box-shadow] duration-[180ms] ease-linear whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)] disabled:opacity-50 disabled:cursor-not-allowed";

const variants = {
  primary:   "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-bg-hover)]",
  secondary: "bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-default)] hover:bg-[var(--bg-hover)]",
  ghost:     "bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
  danger:    "bg-[var(--color-danger-500)] text-white hover:bg-[var(--color-danger-700)]",
};

const sizes = {
  sm: "px-[10px] py-[6px] text-[12px]",
  md: "px-[16px] py-[9px]",
  lg: "px-[20px] py-[12px] text-[14px]",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={[base, variants[variant], sizes[size], className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}