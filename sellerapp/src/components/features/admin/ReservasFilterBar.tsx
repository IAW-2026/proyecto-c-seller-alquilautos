"use client";
import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";

const ESTADOS = ["Todos", "Pendiente", "Aceptada", "Rechazada", "Coordinada", "Pagada", "Entregada", "Finalizada", "Cancelada"];

const inputClass = "border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] px-3 py-[9px] rounded-[var(--radius-md)] text-[13px] font-[inherit] outline-none transition-[border-color,box-shadow] duration-[180ms] focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary-400)_18%,transparent)]";

interface ReservasFilterBarProps {
  estadoActual: string;
  propietarioActual?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  alquiladorActual?: string;
  propietarios: { id_propietario: string; nombre: string; apellido: string }[];
}

export function ReservasFilterBar({
  estadoActual,
  propietarioActual,
  fechaDesde,
  fechaHasta,
  alquiladorActual,
  propietarios,
}: ReservasFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [alquilador, setAlquilador] = useState(alquiladorActual ?? "");
  const [lastAlquiladorActual, setLastAlquiladorActual] = useState(alquiladorActual ?? "");

  if ((alquiladorActual ?? "") !== lastAlquiladorActual) {
    setLastAlquiladorActual(alquiladorActual ?? "");
    setAlquilador(alquiladorActual ?? "");
  }

  const pushParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasFiltros =
    estadoActual !== "Todos" || !!propietarioActual || !!fechaDesde || !!fechaHasta || !!alquiladorActual;

  return (
    <div className="flex items-end gap-3 flex-wrap">
      <div className="flex flex-col gap-[4px]">
        <label className="text-[11px] font-semibold text-[var(--text-secondary)]">Estado</label>
        <select
          value={estadoActual}
          onChange={e => pushParams({ estado: e.target.value === "Todos" ? null : e.target.value })}
          className={inputClass}
        >
          {ESTADOS.map(e => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-[4px]">
        <label className="text-[11px] font-semibold text-[var(--text-secondary)]">Propietario</label>
        <select
          value={propietarioActual ?? ""}
          onChange={e => pushParams({ propietario: e.target.value || null })}
          className={inputClass}
        >
          <option value="">Todos los propietarios</option>
          {propietarios.map(p => (
            <option key={p.id_propietario} value={p.id_propietario}>{p.nombre} {p.apellido}</option>
          ))}
        </select>
      </div>

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
        <label className="text-[11px] font-semibold text-[var(--text-secondary)]">ID Alquilador</label>
        <input
          type="search"
          value={alquilador}
          placeholder="Buscar..."
          onChange={e => setAlquilador(e.target.value)}
          onBlur={() => pushParams({ alquilador: alquilador || null })}
          onKeyDown={e => e.key === "Enter" && pushParams({ alquilador: alquilador || null })}
          className={`${inputClass} min-w-[160px]`}
        />
      </div>

      {hasFiltros && (
        <Button variant="secondary" size="md" onClick={() => router.push(pathname)}>
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
