"use server";
import { auth } from "@clerk/nextjs/server";
import { actualizarEstadoReserva } from "@/lib/services/reserva.service";
import { revalidatePath } from "next/cache";

export async function aceptarReservaAction(id_reserva: string) {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("No autorizado");

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  if (role !== "propietario") throw new Error("No autorizado");

  const result = await actualizarEstadoReserva(id_reserva, "Aceptada");
  if (result.error) throw new Error(result.error);

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