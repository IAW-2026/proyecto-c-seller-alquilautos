"use client";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { fmtDate, daysBetween } from "@/lib/utils";
import type { Reserva, Alquilador, Vehiculo } from "@/lib/types";

interface ReservaRowProps {
  reserva: Reserva;
  alquilador?: Alquilador;
  vehiculo?: Vehiculo;
  onAccept?: (reserva: Reserva) => void;
  onReject?: (reserva: Reserva) => void;
}

export function ReservaRow({ reserva, alquilador, vehiculo, onAccept, onReject }: ReservaRowProps) {
  const dias = daysBetween(reserva.fecha_inicio, reserva.fecha_final);

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] px-4 py-[14px] shadow-[var(--shadow-sm)]">

      {/* Top row */}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[14px] text-[var(--text-primary)]">
            {alquilador ? `${alquilador.nombre} ${alquilador.apellido}` : reserva.id_alquilador}
          </div>
          <div className="text-[12px] text-[var(--text-secondary)] mt-[2px]">
            {vehiculo ? `${vehiculo.marca} ${vehiculo.modelo}` : reserva.id_vehiculo} • {dias} días
          </div>
          <div className="text-[12px] text-[var(--text-secondary)]">
            {fmtDate(reserva.fecha_inicio)} → {fmtDate(reserva.fecha_final)}
          </div>
        </div>
        <div className="ml-auto shrink-0">
          <StatusBadge estado={reserva.estado} />
        </div>
      </div>

      {/* Actions */}
      {reserva.estado === "Pendiente" && onAccept && onReject && (
        <div className="flex gap-2 mt-3">
          <Button variant="secondary" size="sm" className="flex-1" onClick={() => onReject(reserva)}>
            Rechazar
          </Button>
          <Button variant="primary" size="sm" className="flex-1" onClick={() => onAccept(reserva)}>
            Aceptar
          </Button>
        </div>
      )}
    </div>
  );
}