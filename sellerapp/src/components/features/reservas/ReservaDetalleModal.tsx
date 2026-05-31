"use client";
import { useState } from "react";
import { DetalleModal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/Badge";
import { fmtDate, daysBetween, fmtMoney } from "@/lib/utils";
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
  hora_inicio_entrega: string;
  hora_fin_entrega: string;
  hora_inicio_devolucion: string;
  hora_fin_devolucion: string;
}

interface ReservaDetalleModalProps {
  reserva: Reserva;
  alquilador?: Alquilador;
  vehiculo?: Vehiculo;
  horario?: Horario | null;
}

const fieldClass = "flex flex-col gap-[4px]";
const labelClass = "text-[12px] font-semibold text-[var(--text-secondary)]";
const valueClass = "text-[14px] text-[var(--text-primary)]";

export function ReservaDetalleModal({ reserva, alquilador, vehiculo, horario }: ReservaDetalleModalProps) {
  const [open, setOpen] = useState(false);
  const dias  = daysBetween(reserva.fecha_inicio, reserva.fecha_final);
  const total = vehiculo ? vehiculo.precio * dias : 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 px-[10px] py-[6px] rounded-[var(--radius-md)] text-[12px] font-semibold bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-[background] duration-[180ms] cursor-pointer"
      >
        Ver
      </button>

      <DetalleModal open={open} onClose={() => setOpen(false)} title="Detalles de reserva">
        <div className="flex flex-col gap-4">

          {/* Header */}
          <div className="flex justify-between items-center">
            <StatusBadge estado={reserva.estado} />
          </div>

          {/* Grid principal */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-[18px] max-[700px]:grid-cols-1">
            <div className={`${fieldClass} items-start`}>
              <span className={labelClass}>Alquilador</span>
              <span className={valueClass}>
                {alquilador ? `${alquilador.nombre} ${alquilador.apellido}` : reserva.id_alquilador}
              </span>
              {alquilador?.email && (
                <span className="text-[12px] text-[var(--text-secondary)]">{alquilador.email}</span>
              )}
            </div>
            <div className={`${fieldClass} items-end`}>
              <span className={labelClass}>Vehículo</span>
              <span className={valueClass}>
                {vehiculo ? `${vehiculo.marca} ${vehiculo.modelo}` : reserva.id_vehiculo}
              </span>
            </div>
            <div className={`${fieldClass} items-start`}>
              <span className={labelClass}>Fecha inicio</span>
              <span className={valueClass}>{fmtDate(reserva.fecha_inicio)}</span>
            </div>
            <div className={`${fieldClass} items-end`}>
              <span className={labelClass}>Fecha fin</span>
              <span className={valueClass}>{fmtDate(reserva.fecha_final)}</span>
            </div>
            <div className={`${fieldClass} items-start`}>
              <span className={labelClass}>Días</span>
              <span className={valueClass}>{dias}</span>
            </div>
            <div className={`${fieldClass} items-end`}>
              <span className={labelClass}>Total</span>
              <span className="text-[14px] font-bold text-[var(--color-primary-400)]">{fmtMoney(total)}</span>
            </div>
          </div>

          {/* Horarios */}
          {horario && (
            <div className="border-t border-[var(--border-default)] pt-4">
              <div className="text-[13px] font-bold mb-3 text-[var(--text-primary)]">Horarios seleccionados</div>
              <div className="grid grid-cols-2 gap-x-5 gap-y-[18px] max-[700px]:grid-cols-1">
                <div className={`${fieldClass} items-start`}>
                  <span className={labelClass}>Entrega — desde</span>
                  <span className={valueClass}>{horario.hora_inicio_entrega}</span>
                </div>
                <div className={`${fieldClass} items-end`}>
                  <span className={labelClass}>Entrega — hasta</span>
                  <span className={valueClass}>{horario.hora_fin_entrega}</span>
                </div>
                <div className={`${fieldClass} items-start`}>
                  <span className={labelClass}>Devolución — desde</span>
                  <span className={valueClass}>{horario.hora_inicio_devolucion}</span>
                </div>
                <div className={`${fieldClass} items-end`}>
                  <span className={labelClass}>Devolución — hasta</span>
                  <span className={valueClass}>{horario.hora_fin_devolucion}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </DetalleModal>
    </>
  );
}