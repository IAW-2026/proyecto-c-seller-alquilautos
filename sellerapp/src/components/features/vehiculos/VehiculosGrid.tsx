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
  const alquilados = vehiculos.filter(v => v.estado === "Alquilado");
  const filtered =
    filtro === "Disponible" ? disponibles :
    filtro === "Alquilado" ? alquilados :
    vehiculos;

  const opciones = [
    `Todos ${vehiculos.length}`,
    `Disponibles ${disponibles.length}`,
    `Alquilados ${alquilados.length}`,
  ];

  const activoLabel =
    filtro === "Todos" ? opciones[0] :
    filtro === "Disponible" ? opciones[1] :
    opciones[2];

  const handleChange = (op: string) => {
    if (op.startsWith("Todos")) setFiltro("Todos");
    else if (op.startsWith("Disponibles")) setFiltro("Disponible");
    else setFiltro("Alquilado");
  };

  return (
    <>
      <div className="section-head">
        <h3>Mis Vehículos</h3>
        <span className="spacer" />
        <Tabs opciones={opciones} activo={activoLabel} onChange={handleChange} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="car"
          title={filtro === "Todos" ? "Sin vehículos" : `No hay vehículos ${filtro === "Disponible" ? "disponibles" : "alquilados"}`}
          message={filtro === "Todos" ? "Publicá tu primer vehículo" : "Cambiá el filtro para ver el resto de tu flota."}
          action={
            filtro === "Todos" ? (
              <Link href="/dashboard/vehiculos/nuevo" className="btn primary">
                <Icon name="plus" size={14} /> Publicar vehículo
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="veh-grid">
          {filtered.map(v => (
            <VehiculoCard key={v.id_vehiculo} vehiculo={v} />
          ))}
        </div>
      )}
    </>
  );
}