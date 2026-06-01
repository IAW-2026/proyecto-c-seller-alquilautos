"use client";
import { useState } from "react";
import { cambiarEstadoReservaAction } from "@/lib/actions/admin.actions";
import { StatusBadge } from "@/components/ui/Badge";

// ===== SIMULADOR ===== se borra para etapa 3

const FLUJO = ["Pendiente", "Aceptada", "Coordinada", "Pagada", "Entregada", "Finalizada"];

const TRANSICIONES: Record<string, { siguientes: string[]; cancelable: boolean; rechazable: boolean }> = {
  Pendiente:   { siguientes: ["Aceptada"],   cancelable: true,  rechazable: true },
  Aceptada:    { siguientes: ["Coordinada"], cancelable: true,  rechazable: false },
  Coordinada:  { siguientes: ["Pagada"],     cancelable: true,  rechazable: false },
  Pagada:      { siguientes: ["Entregada"],  cancelable: false, rechazable: false },
  Entregada:   { siguientes: ["Finalizada"], cancelable: false, rechazable: false },
};

interface Reserva {
  id_reserva: string;
  estado: string;
  id_alquilador: string;
  fecha_inicio: string;
  fecha_final: string;
  vehiculo: { marca: string; modelo: string };
  propietario: { nombre: string; apellido: string };
}

export function SimuladorCliente({ reservas }: { reservas: Reserva[] }) {
  const [seleccionada, setSeleccionada] = useState<Reserva | null>(null);
  const [estadoActual, setEstadoActual] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const handleSeleccionar = (r: Reserva) => {
    setSeleccionada(r);
    setEstadoActual(r.estado);
    setMensaje(null);
  };

  const handleCambiarEstado = async (nuevoEstado: string) => {
    if (!seleccionada) return;
    setLoading(true);
    setMensaje(null);
    const result = await cambiarEstadoReservaAction(seleccionada.id_reserva, nuevoEstado as any);
    setLoading(false);
    if (result.error) {
      setMensaje({ tipo: "error", texto: result.error });
      return;
    }
    setEstadoActual(nuevoEstado);
    setMensaje({ tipo: "ok", texto: `Estado cambiado a ${nuevoEstado}` });
  };

  const transicion = TRANSICIONES[estadoActual];

  return (
    <div className="grid grid-cols-[320px_1fr] gap-6 max-[900px]:grid-cols-1">

      {/* Lista de reservas */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border-default)] text-[13px] font-semibold text-[var(--text-secondary)]">
          Seleccioná una reserva
        </div>
        {reservas.length === 0 ? (
          <div className="px-4 py-8 text-center text-[13px] text-[var(--text-secondary)]">No hay reservas activas</div>
        ) : (
          <div className="flex flex-col">
            {reservas.map(r => (
              <button
                key={r.id_reserva}
                onClick={() => handleSeleccionar(r)}
                className={`text-left px-4 py-3 border-b border-[var(--border-default)] transition-colors duration-[180ms] hover:bg-[var(--bg-hover)] ${seleccionada?.id_reserva === r.id_reserva ? "bg-[color-mix(in_srgb,var(--color-primary-400)_8%,transparent)]" : ""}`}
              >
                <div className="font-semibold text-[13px] text-[var(--text-primary)]">{r.vehiculo.marca} {r.vehiculo.modelo}</div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{r.propietario.nombre} {r.propietario.apellido}</div>
                <div className="mt-1">
                  <StatusBadge estado={r.estado} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Simulador */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        {!seleccionada ? (
          <div className="h-full flex items-center justify-center text-[var(--text-secondary)] text-[13px]">
            Seleccioná una reserva para simular el flujo
          </div>
        ) : (
          <div className="flex flex-col gap-6">

            {/* Info reserva */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="font-bold text-[17px] text-[var(--text-primary)]">{seleccionada.vehiculo.marca} {seleccionada.vehiculo.modelo}</div>
                <div className="text-[13px] text-[var(--text-secondary)]">{seleccionada.propietario.nombre} {seleccionada.propietario.apellido} · {seleccionada.id_alquilador}</div>
              </div>
              <StatusBadge estado={estadoActual} />
            </div>

            {/* Flujo visual */}
            <div className="flex items-center gap-0 flex-wrap">
              {FLUJO.map((paso, i) => {
                const idx = FLUJO.indexOf(estadoActual);
                const esPasado = i < idx;
                const esActual = i === idx;
                const esFuturo = i > idx;
                return (
                  <div key={paso} className="flex items-center">
                    <div className={`flex flex-col items-center gap-1`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors
                        ${esActual ? "bg-[var(--color-primary-400)] text-white" : ""}
                        ${esPasado ? "bg-[var(--color-success-500)] text-white" : ""}
                        ${esFuturo ? "bg-[var(--color-neutral-200)] text-[var(--text-tertiary)]" : ""}
                      `}>
                        {esPasado ? "✓" : i + 1}
                      </div>
                      <span className={`text-[10px] font-semibold whitespace-nowrap
                        ${esActual ? "text-[var(--color-primary-400)]" : ""}
                        ${esPasado ? "text-[var(--color-success-500)]" : ""}
                        ${esFuturo ? "text-[var(--text-tertiary)]" : ""}
                      `}>{paso}</span>
                    </div>
                    {i < FLUJO.length - 1 && (
                      <div className={`w-8 h-[2px] mb-4 ${i < idx ? "bg-[var(--color-success-500)]" : "bg-[var(--color-neutral-200)]"}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mensaje */}
            {mensaje && (
              <div className={`px-3 py-2 rounded-[var(--radius-md)] text-[13px] ${mensaje.tipo === "ok" ? "bg-[var(--color-success-50)] text-[var(--color-success-700)]" : "bg-[var(--color-danger-50)] text-[var(--color-danger-700)]"}`}>
                {mensaje.texto}
              </div>
            )}

            {/* Acciones */}
            {transicion && (
              <div className="flex flex-wrap gap-3">
                {transicion.siguientes.map(sig => (
                  <button
                    key={sig}
                    onClick={() => handleCambiarEstado(sig)}
                    disabled={loading}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-[var(--radius-md)] text-[13px] font-semibold bg-[var(--color-primary-400)] text-white hover:bg-[var(--color-primary-500)] transition-colors duration-[180ms] disabled:opacity-50"
                  >
                    {loading ? "Procesando..." : `Simular: ${sig}`}
                  </button>
                ))}
                {transicion.rechazable && (
                  <button
                    onClick={() => handleCambiarEstado("Rechazada")}
                    disabled={loading}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-[var(--radius-md)] text-[13px] font-semibold bg-[var(--color-danger-500)] text-white hover:bg-[var(--color-danger-700)] transition-colors duration-[180ms] disabled:opacity-50"
                  >
                    Rechazar
                  </button>
                )}
                {transicion.cancelable && (
                  <button
                    onClick={() => handleCambiarEstado("Cancelada")}
                    disabled={loading}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-[var(--radius-md)] text-[13px] font-semibold border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors duration-[180ms] disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            )}

            {!transicion && (
              <div className="text-[13px] text-[var(--text-secondary)]">
                Esta reserva ya llegó a su estado final.
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}