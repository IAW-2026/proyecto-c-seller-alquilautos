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
}

export function VehiculosGrid({ vehiculos }: VehiculosGridProps) {
  const [filtro, setFiltro] = useState<"Todos" | "Disponible" | "Alquilado">("Todos");

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
  };

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
          {filtered.map(v => (
            <VehiculoCard key={v.id_vehiculo} vehiculo={v} />
          ))}
        </div>
      )}
    </>
  );
}