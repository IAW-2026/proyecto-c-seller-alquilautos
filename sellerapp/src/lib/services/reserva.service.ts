
import { findVehiculoById } from "@/lib/repositories/vehiculo.repository";
import { findPropietarioById } from "@/lib/repositories/propietario.repository";
import type { CrearReservaInput } from "@/lib/validators/reserva";
import { findReservaById, createReserva, updateReservaEstado, findReservasByPropietario } from "@/lib/repositories/reserva.repository";

function parseFecha(fecha: string): Date {
  const [dia, mes, anio] = fecha.split("-");
  return new Date(`${anio}-${mes}-${dia}`);
}

export async function getReserva(id: string) {
  const reserva = await findReservaById(id);

  if (!reserva) {
    return { data: null, error: "Reserva no encontrada" };
  }

  return { data: reserva, error: null };
}

//valida que el vehiculo y el propietario existan, y que las fechas sean correctas antes de crear la reserva
export async function crearReserva(input: CrearReservaInput) {
  const vehiculo = await findVehiculoById(input.id_vehiculo);
  if (!vehiculo) {
    return { data: null, error: "Vehículo no encontrado" };
  }

  const propietario = await findPropietarioById(input.id_propietario);
  if (!propietario) {
    return { data: null, error: "Propietario no encontrado" };
  }

  const fecha_inicio = parseFecha(input.fecha_inicio);
  const fecha_final = parseFecha(input.fecha_final);

  if (fecha_inicio >= fecha_final) {
    return { data: null, error: "La fecha de inicio debe ser anterior a la fecha final" };
  }

  const reserva = await createReserva({
    id_alquilador: input.id_alquilador,
    id_vehiculo: input.id_vehiculo,
    id_propietario: input.id_propietario,
    fecha_inicio,
    fecha_final,
  });

  return { data: { id_reserva: reserva.id_reserva }, error: null };
}



export async function actualizarEstadoReserva(id: string, estado: "Aceptada" | "Rechazada") {
  const reserva = await findReservaById(id);
  if (!reserva) return { data: null, error: "Reserva no encontrada" };
  if (reserva.estado !== "Pendiente") return { data: null, error: "Solo se pueden modificar reservas pendientes" };
  const updated = await updateReservaEstado(id, estado);
  return { data: updated, error: null };
}

export async function getReservasByPropietario(id_propietario: string) {
  const reservas = await findReservasByPropietario(id_propietario);
  return { data: { reservas }, error: null };
}