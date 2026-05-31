"use client";

interface TabsProps {
  opciones: string[];
  activo: string;
  onChange: (opcion: string) => void;
}

const tabBase = "border-none px-[14px] py-[7px] rounded-[var(--radius-full)] text-[12px] font-semibold cursor-pointer transition-[background,color] duration-[180ms]";

export function Tabs({ opciones, activo, onChange }: TabsProps) {
  return (
    <div
      className="inline-flex bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-full)] p-[4px] gap-[2px]"
      role="tablist"
    >
      {opciones.map(opcion => (
        <button
          key={opcion}
          role="tab"
          aria-selected={activo === opcion}
          onClick={() => onChange(opcion)}
          className={[
            tabBase,
            activo === opcion
              ? "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]"
              : "bg-transparent text-[var(--text-secondary)]",
          ].join(" ")}
        >
          {opcion}
        </button>
      ))}
    </div>
  );
}