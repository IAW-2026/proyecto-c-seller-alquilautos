"use server";
import {
  getResenaVehiculoReserva,
  getResenaPropietarioReserva,
  getResenaAlquiladorReserva,
  crearResena,
  responderResena,
} from "@/lib/mocks/feedbackApp";
import { auth } from "@clerk/nextjs/server";

export async function getResenasReservaAction(id_reserva: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("No autorizado");

  const [resenaVehiculo, resenaPropietario, resenaAlquilador] = await Promise.all([
    getResenaVehiculoReserva(id_reserva),
    getResenaPropietarioReserva(id_reserva),
    getResenaAlquiladorReserva(id_reserva),
  ]);

  return { resenaVehiculo, resenaPropietario, resenaAlquilador };
}

export async function responderResenaAction(data: {
  id_resena: string;
  id_propietario: string;
  respuesta: string;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("No autorizado");

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  if (role !== "propietario") throw new Error("No autorizado");

  return responderResena(data);
}

export async function crearResenaAction(data: {
  idReserva: string;
  idEmisor: string;
  calificacionGeneral: number;
  descripcion: string;
  idAlquilador?: string;
  calificacionComunicacion?: number;
  calificacionPuntualidad?: number;
  calificacionDevolucion?: number;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("No autorizado");

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  if (role !== "propietario") throw new Error("No autorizado");

  return crearResena(data);
}