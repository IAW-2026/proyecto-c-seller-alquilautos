"use client";
import { useState } from "react";
import { DetalleModal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/Badge";
import { fmtDate, daysBetween, fmtMoney } from "@/lib/utils";
import { getHorarioSeleccionado } from "@/lib/mocks/shippingApp";
import ReservasActions from "./ReservasAction";
import type { Reserva } from "@/lib/types";

interface Alquilador {
  id_alquilador: string;
  nombre: string;
  apellido: string;
  email: string;
}

interface Vehiculo {
  id_vehiculo: string;
  marca: string;
  modelo: string;
  precio: number;
}

interface Horario {
  hora_inicio: string;
  hora_fin: string;
}

interface ReservaDetalleModalProps {
  reserva: Reserva;
  alquilador?: Alquilador;
  vehiculo?: Vehiculo;
  horario?: Horario | null;
}

export function ReservaDetalleModal({ reserva, alquilador, vehiculo, horario }: ReservaDetalleModalProps) {
  const [open, setOpen] = useState(false);
  const dias = daysBetween(reserva.fecha_inicio, reserva.fecha_final);
  const total = vehiculo ? vehiculo.precio * dias : 0;

  return (
    <>
      <button className="btn secondary sm" onClick={() => setOpen(true)}>
        Ver
      </button>
      <DetalleModal
        open={open}
        onClose={() => setOpen(false)}
        title="Detalle de reserva"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>ID: {reserva.id_reserva}</span>
            <StatusBadge estado={reserva.estado} />
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Alquilador</label>
              <div>{alquilador ? `${alquilador.nombre} ${alquilador.apellido}` : reserva.id_alquilador}</div>
              {alquilador?.email && (
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{alquilador.email}</div>
              )}
            </div>
            <div className="field">
              <label>Vehículo</label>
              <div>{vehiculo ? `${vehiculo.marca} ${vehiculo.modelo}` : reserva.id_vehiculo}</div>
            </div>
            <div className="field">
              <label>Fecha inicio</label>
              <div>{fmtDate(reserva.fecha_inicio)}</div>
            </div>
            <div className="field">
              <label>Fecha fin</label>
              <div>{fmtDate(reserva.fecha_final)}</div>
            </div>
            <div className="field">
              <label>Días</label>
              <div>{dias}</div>
            </div>
            <div className="field">
              <label>Total</label>
              <div style={{ color: "var(--color-primary-400)", fontWeight: 700 }}>{fmtMoney(total)}</div>
            </div>
          </div>

          {horario && (
            <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Horarios seleccionados</div>
              <div className="form-grid">
                <div className="field">
                  <label>Hora de entrega</label>
                  <div>{horario.hora_inicio}</div>
                </div>
                <div className="field">
                  <label>Hora de devolución</label>
                  <div>{horario.hora_fin}</div>
                </div>
              </div>
            </div>
          )}

          {reserva.estado === "Pendiente" && (
            <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: 16 }}>
              <ReservasActions reserva={reserva} />
            </div>
          )}
        </div>
      </DetalleModal>
    </>
  );
}