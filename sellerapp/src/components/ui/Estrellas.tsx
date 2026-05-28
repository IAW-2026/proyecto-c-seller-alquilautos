interface EstrellasProps {
  valor: number;
  onChange?: (v: number) => void;
}

export function Estrellas({ valor, onChange }: EstrellasProps) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          onClick={() => onChange?.(i)}
          style={{
            cursor: onChange ? "pointer" : "default",
            fontSize: 18,
            color: i <= valor ? "#f59e0b" : "var(--border-default)",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}