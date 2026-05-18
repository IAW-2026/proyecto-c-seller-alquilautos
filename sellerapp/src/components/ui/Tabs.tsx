"use client";

interface TabsProps {
  opciones: string[];
  activo: string;
  onChange: (opcion: string) => void;
}

export function Tabs({ opciones, activo, onChange }: TabsProps) {
  return (
    <div className="tabs" role="tablist">
      {opciones.map(opcion => (
        <button
          key={opcion}
          role="tab"
          aria-selected={activo === opcion}
          className={activo === opcion ? "active" : ""}
          onClick={() => onChange(opcion)}
        >
          {opcion}
        </button>
      ))}
    </div>
  );
}