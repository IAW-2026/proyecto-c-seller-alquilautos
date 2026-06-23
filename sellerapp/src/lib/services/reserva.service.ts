
import { findVehiculoById, updateVehiculo  } from "@/lib/repositories/vehiculo.repository";
import { findPropietarioById } from "@/lib/repositories/propietario.repository";
import type { CrearReservaInput } from "@/lib/validators/reserva";
import { findReservasByAlquilador, findReservaById, createReserva, updateReservaEstado, findReservasByPropietario } from "@/lib/repositories/reserva.repository";
import type { ReservaFiltros } from "@/lib/repositories/reserva.repository";
import { EstadoReserva } from "@prisma/client";
import {cancelarEntrega  } from "@/lib/mocks/shippingApp";
import { iniciarPago } from "@/lib/mocks/paymentsApp";


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



export async function actualizarEstadoReserva(id: string, estado: EstadoReserva) {
  const reserva = await findReservaById(id);
  if (!reserva) return { data: null, error: "Reserva no encontrada" };
  await updateReservaEstado(id, estado);
  if (estado === EstadoReserva.Finalizada || estado === EstadoReserva.Rechazada) {
    await updateVehiculo(reserva.id_vehiculo, { estado: "Disponible" });
  }
  return { data: { id_reserva: id, estado }, error: null };
}

export async function getReservasByPropietario(id_propietario: string, filtros?: ReservaFiltros) {
  const reservas = await findReservasByPropietario(id_propietario, filtros);
  return { data: { reservas }, error: null };
}

export async function getReservasByAlquilador(id_alquilador: string) {
  const reservas = await findReservasByAlquilador(id_alquilador);
  return { data: { reservas }, error: null };
}

export async function cancelarReserva(id: string) {
  const reserva = await findReservaById(id);
  if (!reserva) return { data: null, error: "Reserva no encontrada" };

  const estadosCancelables: EstadoReserva[] = [
    EstadoReserva.Pendiente,
    EstadoReserva.Aceptada,
    EstadoReserva.Coordinada,
  ];

  if (!estadosCancelables.includes(reserva.estado)) {
    return { data: null, error: "La reserva no puede cancelarse en su estado actual" };
  }

  await updateReservaEstado(id, EstadoReserva.Cancelada);

  let avisoEntrega: string | null = null;
  if (reserva.estado === EstadoReserva.Coordinada) {
    const entrega = await cancelarEntrega(id);
    if (entrega.error) {
      avisoEntrega = `La reserva se canceló, pero no se pudo avisar a Shipping App: ${entrega.error}`;
    }
  }

  await updateVehiculo(reserva.id_vehiculo, { estado: "Disponible" });

  return { data: { id_reserva: id, estado: "Cancelada", aviso: avisoEntrega }, error: null };
}

export async function coordinarReserva(id: string) {
  const reserva = await findReservaById(id);
  if (!reserva) return { data: null, error: "Reserva no encontrada" };

  const vehiculo = await findVehiculoById(reserva.id_vehiculo);
  if (!vehiculo) return { data: null, error: "Vehículo no encontrado" };

  const dias = Math.ceil(
    (reserva.fecha_final.getTime() - reserva.fecha_inicio.getTime()) / (1000 * 60 * 60 * 24)
  );
  const monto_pagar = Number(vehiculo.precio) * dias;

  const pago = await iniciarPago({
    id_reserva: id,
    id_alquilador: reserva.id_alquilador,
    id_propietario: reserva.id_propietario,
    monto_pagar,
  });

  if (pago.error) {
    return { data: null, error: `No se pudo iniciar el pago: ${pago.error}` };
  }

  await updateReservaEstado(id, EstadoReserva.Coordinada);

  return { data: { id_reserva: id, estado: "Coordinada" }, error: null };
}