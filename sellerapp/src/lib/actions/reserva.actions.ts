"use server";
import { auth } from "@clerk/nextjs/server";
import { actualizarEstadoReserva, getReserva  } from "@/lib/services/reserva.service";
import { revalidatePath } from "next/cache";
import { createEntrega  } from "@/lib/mocks/shippingApp";

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
  if (role !== "propietario") throw new Error("No autorizado");

  const reservaResult = await getReserva(id_reserva);
  if (reservaResult.error || !reservaResult.data) throw new Error("Reserva no encontrada");

  const result = await actualizarEstadoReserva(id_reserva, "Aceptada");
  if (result.error) throw new Error(result.error);

  await createEntrega({
    id_reserva,
    id_vehiculo,
    id_propietario,
    id_alquilador,
    ...horario,
    fecha_inicio: reservaResult.data.fecha_inicio,
    fecha_fin: reservaResult.data.fecha_final,
  });

  revalidatePath("/dashboard/reservas");
  revalidatePath("/dashboard");
  return result.data;
}

export async function rechazarReservaAction(id_reserva: string) {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("No autorizado");

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  if (role !== "propietario") throw new Error("No autorizado");

  const result = await actualizarEstadoReserva(id_reserva, "Rechazada");
  if (result.error) throw new Error(result.error);

  revalidatePath("/dashboard/reservas");
  revalidatePath("/dashboard");
  return result.data;
}