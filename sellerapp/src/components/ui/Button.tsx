import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({ variant = "primary", size = "md", children, className, ...rest }: ButtonProps) {
  const cls = [
    "btn",
    variant,
    size === "sm" ? "sm" : size === "lg" ? "lg" : "",
    className,
  ].filter(Boolean).join(" ");
  return <button className={cls} {...rest}>{children}</button>;
}