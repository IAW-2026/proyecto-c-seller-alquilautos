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

  const [vehiculoRes, propietarioRes, alquiladorRes] = await Promise.all([
    getResenaVehiculoReserva(id_reserva),
    getResenaPropietarioReserva(id_reserva),
    getResenaAlquiladorReserva(id_reserva),
  ]);

  const resenaVehiculo = {
    ...vehiculoRes.data,
    id_resena: vehiculoRes.data?.id_resena ?? null,
    id_reserva,
    calificacion_general: vehiculoRes.data?.calificacion_general ?? 0,
    descripcion: vehiculoRes.data?.descripcion ?? "",
    respuesta: vehiculoRes.data?.respuesta ?? null,
  };

  const resenaPropietario = {
    ...propietarioRes.data,
    id_resena: propietarioRes.data?.id_resena ?? null,
    id_reserva,
    calificacion_general: propietarioRes.data?.calificacion_general ?? 0,
    descripcion: propietarioRes.data?.descripcion ?? "",
    respuesta: propietarioRes.data?.respuesta ?? null,
  };

  const resenaAlquilador = {
    id_resena: null,
    id_reserva,
    id_alquilador: null,
    id_emisor: null,
    calificacion_general: null,
    descripcion: null,
    fecha_creacion: null,
    calificacion_comunicacion: null,
    calificacion_puntualidad: null,
    calificacion_devolucion: null,
    respuesta: null,
    ...alquiladorRes.data,
  };

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
  if (role !== "propietario" && role !== "adminSeller") throw new Error("No autorizado");

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
  if (role !== "propietario" && role !== "adminSeller") throw new Error("No autorizado");

  return crearResena(data);
}