"use client";
import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";

const ESTADOS = ["Pendiente", "Aceptada", "Rechazada", "Coordinada", "Pagada", "Entregada", "Finalizada", "Cancelada"];

const inputClass = "border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] px-3 py-[9px] rounded-[var(--radius-md)] text-[13px] font-[inherit] outline-none transition-[border-color,box-shadow] duration-[180ms] focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary-400)_18%,transparent)]";

interface FilterBarProps {
  estadosActuales: string[];
  fechaDesde?: string;
  fechaHasta?: string;
  vehiculoActual?: string;
  vehiculos: { id_vehiculo: string; marca: string; modelo: string }[];
}

export function FilterBar({ estadosActuales, fechaDesde, fechaHasta, vehiculoActual, vehiculos }: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pushParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleEstado = (estado: string) => {
    const next = estadosActuales.includes(estado)
      ? estadosActuales.filter(e => e !== estado)
      : [...estadosActuales, estado];
    pushParams({ estados: next.length ? next.join(",") : null });
  };

  const hasFiltros = estadosActuales.length > 0 || !!fechaDesde || !!fechaHasta || !!vehiculoActual;

  return (
    <div className="flex items-end gap-3 flex-wrap">
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

      <div className="relative flex flex-col gap-[4px]">
        <label className="text-[11px] font-semibold text-[var(--text-secondary)]">Estado</label>
        <button
          type="button"
          onClick={() => setOpen(prev => !prev)}
          className="inline-flex items-center gap-2 px-[16px] py-[9px] rounded-[var(--radius-md)] text-[13px] font-semibold bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-[background] duration-[180ms] cursor-pointer"
        >
          {estadosActuales.length === 0 ? "Todos" : `${estadosActuales.length} seleccionado${estadosActuales.length > 1 ? "s" : ""}`}
          <span className="text-[10px]">▼</span>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute top-[calc(100%+6px)] left-0 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] z-20 min-w-[180px] overflow-hidden">
              {ESTADOS.map(estado => (
                <label
                  key={estado}
                  className="flex items-center gap-[8px] px-[14px] py-[10px] text-[13px] cursor-pointer hover:bg-[var(--bg-hover)] transition-[background] duration-[180ms]"
                >
                  <input
                    type="checkbox"
                    checked={estadosActuales.includes(estado)}
                    onChange={() => toggleEstado(estado)}
                  />
                  {estado}
                </label>
              ))}
            </div>
          </>
        )}
      </div>

      {hasFiltros && (
        <Button variant="secondary" size="md" onClick={() => router.push(pathname)}>
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
