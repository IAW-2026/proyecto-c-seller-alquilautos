interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}

export function Field({ label, error, hint, htmlFor, children }: FieldProps) {
  return (
    <div className="field">
      {label && <label htmlFor={htmlFor}>{label}</label>}
      {children}
      {hint && !error && <div className="hint">{hint}</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}