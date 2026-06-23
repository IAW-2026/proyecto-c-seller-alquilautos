"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const inputClass = "border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] px-3 py-[9px] rounded-[var(--radius-md)] text-[13px] font-[inherit] outline-none transition-[border-color,box-shadow] duration-[180ms] focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary-400)_18%,transparent)]";

const PERIODOS = [
  { value: "7d", label: "Últimos 7 días" },
  { value: "30d", label: "Últimos 30 días" },
  { value: "90d", label: "Últimos 90 días" },
  { value: "esteMes", label: "Este mes" },
  { value: "esteAnio", label: "Este año" },
  { value: "custom", label: "Rango personalizado" },
];

interface IngresosFilterBarProps {
  periodoActual: string;
  fechaDesde?: string;
  fechaHasta?: string;
  vehiculoActual?: string;
  vehiculos: { id_vehiculo: string; marca: string; modelo: string }[];
}

export function IngresosFilterBar({ periodoActual, fechaDesde, fechaHasta, vehiculoActual, vehiculos }: IngresosFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pushParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePeriodo = (value: string) => {
    if (value === "custom") {
      pushParams({ periodo: value });
    } else {
      pushParams({ periodo: value, fechaDesde: null, fechaHasta: null });
    }
  };

  return (
    <div className="flex items-end gap-3 flex-wrap">
      <div className="flex flex-col gap-[4px]">
        <label className="text-[11px] font-semibold text-[var(--text-secondary)]">Período</label>
        <select
          value={periodoActual}
          onChange={e => handlePeriodo(e.target.value)}
          className={inputClass}
        >
          {PERIODOS.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {periodoActual === "custom" && (
        <>
          <div className="flex flex-col gap-[4px]">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)]">Desde</label>
            <input
              type="date"
              value={fechaDesde ?? ""}
              onChange={e => pushParams({ fechaDesde: e.target.value || null })}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-[4px]">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)]">Hasta</label>
            <input
              type="date"
              value={fechaHasta ?? ""}
              onChange={e => pushParams({ fechaHasta: e.target.value || null })}
              className={inputClass}
            />
          </div>
        </>
      )}

      <div className="flex flex-col gap-[4px]">
        <label className="text-[11px] font-semibold text-[var(--text-secondary)]">Vehículo</label>
        <select
          value={vehiculoActual ?? ""}
          onChange={e => pushParams({ vehiculo: e.target.value || null })}
          className={inputClass}
        >
          <option value="">Todos los vehículos</option>
          {vehiculos.map(v => (
            <option key={v.id_vehiculo} value={v.id_vehiculo}>{v.marca} {v.modelo}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
