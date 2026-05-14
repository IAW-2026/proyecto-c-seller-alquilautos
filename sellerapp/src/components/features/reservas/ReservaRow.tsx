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
    <div className="res-row">
      <div className="top">
        <div>
          <div className="name">
            {alquilador ? `${alquilador.nombre} ${alquilador.apellido}` : reserva.id_alquilador}
          </div>
          <div className="meta">
            {vehiculo ? `${vehiculo.marca} ${vehiculo.modelo}` : reserva.id_vehiculo} • {dias} días
          </div>
          <div className="meta">
            {fmtDate(reserva.fecha_inicio)} → {fmtDate(reserva.fecha_final)}
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <StatusBadge estado={reserva.estado} />
        </div>
      </div>
      {reserva.estado === "Pendiente" && onAccept && onReject && (
        <div className="actions">
          <Button variant="secondary" size="sm" onClick={() => onReject(reserva)}>Rechazar</Button>
          <Button variant="primary" size="sm" onClick={() => onAccept(reserva)}>Aceptar</Button>
        </div>
      )}
    </div>
  );
}