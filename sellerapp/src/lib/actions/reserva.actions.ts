"use server";
import { auth } from "@clerk/nextjs/server";
import { actualizarEstadoReserva, getReserva  } from "@/lib/services/reserva.service";
import { revalidatePath } from "next/cache";
import { createEntrega  } from "@/lib/mocks/shippingApp";
import { updateVehiculo } from "../repositories/vehiculo.repository";


export async function aceptarReservaAction(
  id_reserva: string,
  horario: {
    hora_inicio_entrega: string;
    hora_fin_entrega: string;
    hora_inicio_devolucion: string;
    hora_fin_devolucion: string;
  },
  monto_pagar: number,
  id_alquilador: string,
  id_propietario: string,
  id_vehiculo: string
) {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("No autorizado");

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  if (role !== "propietario" && role !== "adminSeller") throw new Error("No autorizado");

  const reservaResult = await getReserva(id_reserva);
  if (reservaResult.error || !reservaResult.data) throw new Error("Reserva no encontrada");

  const isoDate = (d: Date) => d.toISOString().slice(0, 10);

  const entrega = await createEntrega({
    id_reserva,
    id_vehiculo,
    id_propietario,
    id_alquilador,
    coordinaciones: [
      {
        tipo: "entrega",
        fecha: isoDate(reservaResult.data.fecha_inicio),
        hora_inicio_disponible: horario.hora_inicio_entrega,
        hora_fin_disponible: horario.hora_fin_entrega,
      },
      {
        tipo: "devolucion",
        fecha: isoDate(reservaResult.data.fecha_final),
        hora_inicio_disponible: horario.hora_inicio_devolucion,
        hora_fin_disponible: horario.hora_fin_devolucion,
      },
    ],
  });
  if (entrega.error) throw new Error(`No se pudo coordinar la entrega: ${entrega.error}`);

  const result = await actualizarEstadoReserva(id_reserva, "Aceptada");
  if (result.error) throw new Error(result.error);

  await updateVehiculo(id_vehiculo, { estado: "Alquilado" });

  revalidatePath("/dashboard/reservas");
  revalidatePath("/dashboard");
  return result.data;
}

export async function rechazarReservaAction(id_reserva: string) {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("No autorizado");

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  if (role !== "propietario" && role !== "adminSeller") throw new Error("No autorizado");

  const result = await actualizarEstadoReserva(id_reserva, "Rechazada");
  if (result.error) throw new Error(result.error);

  revalidatePath("/dashboard/reservas");
  revalidatePath("/dashboard");
  return result.data;
}