"use server";
import {
  getResenaVehiculoReserva,
  getResenaPropietarioReserva,
  getResenaAlquiladorReserva,
  crearResena,
  responderResena,
} from "@/lib/mocks/feedbackApp";
import { auth } from "@clerk/nextjs/server";
import { isAdminRole } from "@/lib/auth/roles";

const ESTADO_APROBADA = "APROBADA";

export async function getResenasReservaAction(id_reserva: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("No autorizado");

  const [vehiculoRes, propietarioRes, alquiladorRes] = await Promise.all([
    getResenaVehiculoReserva(id_reserva),
    getResenaPropietarioReserva(id_reserva),
    getResenaAlquiladorReserva(id_reserva),
  ]);

  // Las reseñas que el alquilador dejó sobre el vehículo/propietario solo se muestran
  // si ya fueron aprobadas por moderación. La reseña que el propietario escribe sobre
  // el alquilador no se filtra: se usa para detectar si ya fue enviada y evitar duplicados.
  const vehiculoData    = vehiculoRes.data?.estado_moderacion    === ESTADO_APROBADA ? vehiculoRes.data    : null;
  const propietarioData = propietarioRes.data?.estado_moderacion === ESTADO_APROBADA ? propietarioRes.data : null;
  const alquiladorData  = alquiladorRes.data;

  const resenaVehiculo = {
    ...vehiculoData,
    id_resena: vehiculoData?.id_resena ?? null,
    id_reserva,
    calificacion_general: vehiculoData?.calificacion_general ?? 0,
    descripcion: vehiculoData?.descripcion ?? "",
    respuesta: vehiculoData?.respuesta ?? null,
  };

  const resenaPropietario = {
    ...propietarioData,
    id_resena: propietarioData?.id_resena ?? null,
    id_reserva,
    calificacion_general: propietarioData?.calificacion_general ?? 0,
    descripcion: propietarioData?.descripcion ?? "",
    respuesta: propietarioData?.respuesta ?? null,
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
    estado_moderacion: null,
    ...alquiladorData,
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
  if (role !== "propietario" && !isAdminRole(role)) throw new Error("No autorizado");

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
  if (role !== "propietario" && !isAdminRole(role)) throw new Error("No autorizado");

  return crearResena(data);
}