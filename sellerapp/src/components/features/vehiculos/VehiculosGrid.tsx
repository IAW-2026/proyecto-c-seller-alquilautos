"use client";
import { useState } from "react";
import { VehiculoCard } from "./VehiculoCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tabs } from "@/components/ui/Tabs";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import type { Vehiculo } from "@/lib/types";

interface VehiculosGridProps {
  vehiculos: Vehiculo[];
  tipoCambio?: number;
  statsPorVehiculo?: Map<string, { vecesAlquilado: number; totalGenerado: number }>;
}

const PAGE_SIZE = 10;

export function VehiculosGrid({ vehiculos, tipoCambio = 0, statsPorVehiculo }: VehiculosGridProps) {
  const [filtro, setFiltro] = useState<"Todos" | "Disponible" | "Alquilado">("Todos");
  const [page, setPage] = useState(1);
  const disponibles = vehiculos.filter(v => v.estado === "Disponible");
  const alquilados  = vehiculos.filter(v => v.estado === "Alquilado");
  const filtered =
    filtro === "Disponible" ? disponibles :
    filtro === "Alquilado"  ? alquilados  :
    vehiculos;

  const opciones = [
    `Todos ${vehiculos.length}`,
    `Disponibles ${disponibles.length}`,
    `Alquilados ${alquilados.length}`,
  ];

  const activoLabel =
    filtro === "Todos"       ? opciones[0] :
    filtro === "Disponible"  ? opciones[1] :
    opciones[2];

  const handleChange = (op: string) => {
    if (op.startsWith("Todos"))       setFiltro("Todos");
    else if (op.startsWith("Disp"))   setFiltro("Disponible");
    else                              setFiltro("Alquilado");
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      {/* Section head */}
      <div className="flex items-center gap-[10px] mt-7 mb-[14px] flex-wrap">
        <h3 className="m-0 text-[17px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">
          Mis Vehículos
        </h3>
        <span className="flex-1" />
        <Tabs opciones={opciones} activo={activoLabel} onChange={handleChange} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="car"
          title={filtro === "Todos" ? "Sin vehículos" : `No hay vehículos ${filtro === "Disponible" ? "disponibles" : "alquilados"}`}
          message={filtro === "Todos" ? "Publicá tu primer vehículo" : "Cambiá el filtro para ver el resto de tu flota."}
          action={
            filtro === "Todos" ? (
              <Link
                href="/dashboard/vehiculos/nuevo"
                className="inline-flex items-center gap-2 px-[16px] py-[9px] rounded-[var(--radius-md)] text-[13px] font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-bg-hover)] transition-[background] duration-[180ms]"
              >
                <Icon name="plus" size={14} /> Publicar vehículo
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-[18px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {pageItems.map(v => {
            const stats = statsPorVehiculo?.get(v.id_vehiculo);
            return (
              <VehiculoCard
                key={v.id_vehiculo}
                vehiculo={v}
                tipoCambio={tipoCambio}
                vecesAlquilado={stats?.vecesAlquilado ?? 0}
                totalGenerado={stats?.totalGenerado ?? 0}
              />
            );
          })}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5 text-[12px] text-[var(--text-secondary)]">
          <span>Página {page} de {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 && (
              <button onClick={() => setPage(p => p - 1)} className="inline-flex items-center justify-center px-[10px] py-[6px] rounded-[var(--radius-md)] text-[12px] font-semibold bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors duration-[180ms]">Anterior</button>
            )}
            {page < totalPages && (
              <button onClick={() => setPage(p => p + 1)} className="inline-flex items-center justify-center px-[10px] py-[6px] rounded-[var(--radius-md)] text-[12px] font-semibold bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors duration-[180ms]">Siguiente</button>
            )}
          </div>
        </div>
      )}
    </>
  );
}