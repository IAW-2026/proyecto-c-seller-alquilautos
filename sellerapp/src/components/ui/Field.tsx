interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}

export function Field({ label, error, hint, htmlFor, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-[6px]">
      {label && (
        <label htmlFor={htmlFor} className="text-[12px] font-semibold text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      {children}
      {hint && !error && (
        <div className="text-[12px] text-[var(--text-tertiary)]">{hint}</div>
      )}
      {error && (
        <div className="text-[12px] text-[var(--color-danger-500)]">{error}</div>
      )}
    </div>
  );
}