"use client";
import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";

const ESTADOS = ["Todos", "Disponible", "Alquilado"];

const inputClass = "border border-[var(--border-default)] bg-[var(--bg-page)] text-[var(--text-primary)] px-3 py-2 rounded-[var(--radius-md)] text-[13px] font-[inherit] outline-none transition-[border-color,box-shadow] duration-[180ms] focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary-400)_18%,transparent)]";

interface VehiculosFilterBarProps {
  qActual: string;
  estadoActual: string;
}

export function VehiculosFilterBar({ qActual, estadoActual }: VehiculosFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(qActual);
  const [lastQActual, setLastQActual] = useState(qActual);

  if (qActual !== lastQActual) {
    setLastQActual(qActual);
    setQ(qActual);
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

  const hasFiltros = !!qActual || estadoActual !== "Todos";

  return (
    <div className="flex gap-3 items-center px-4 py-[14px] border-b border-[var(--border-default)] flex-wrap">
      <input
        type="search"
        value={q}
        placeholder="Buscar por marca o modelo..."
        aria-label="Buscar vehículos"
        onChange={e => setQ(e.target.value)}
        onBlur={() => pushParams({ q: q || null })}
        onKeyDown={e => e.key === "Enter" && pushParams({ q: q || null })}
        className={`${inputClass} min-w-[240px]`}
      />

      <select
        value={estadoActual}
        onChange={e => pushParams({ estado: e.target.value === "Todos" ? null : e.target.value })}
        className={inputClass}
      >
        {ESTADOS.map(e => (
          <option key={e} value={e}>{e}</option>
        ))}
      </select>

      {hasFiltros && (
        <Button variant="secondary" size="md" onClick={() => router.push(pathname)}>
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
