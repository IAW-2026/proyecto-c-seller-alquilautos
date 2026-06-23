import { auth } from "@clerk/nextjs/server";

async function authHeaders(): Promise<Record<string, string>> {
  const { getToken } = await auth();
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface ResenaItem {
  id_resena: string;
  id_reserva: string;
  id_emisor: string;
  calificacion_general: number;
  descripcion: string;
  fecha_creacion: string;
  calificacion_comunicacion?: number;
  calificacion_puntualidad?: number;
  calificacion_devolucion?: number;
  calificacion_limpieza?: number;
  calificacion_estado?: number;
  calificacion_comodidad?: number;
}

interface RawResena {
  ["id_reseña"]: string | number;
  id_reserva: string | number;
  id_emisor: string | number;
  calificacion_general: number;
  descripcion: string;
  fecha_creacion: string;
  calificacion_comunicacion?: number;
  calificacion_puntualidad?: number;
  calificacion_devolucion?: number;
  calificacion_limpieza?: number;
  calificacion_estado?: number;
  calificacion_comodidad?: number;
}

function mapResena(r: RawResena): ResenaItem {
  return {
    id_resena: String(r["id_reseña"]),
    id_reserva: String(r.id_reserva),
    id_emisor: String(r.id_emisor),
    calificacion_general: r.calificacion_general,
    descripcion: r.descripcion,
    fecha_creacion: r.fecha_creacion,
    calificacion_comunicacion: r.calificacion_comunicacion,
    calificacion_puntualidad: r.calificacion_puntualidad,
    calificacion_devolucion: r.calificacion_devolucion,
    calificacion_limpieza: r.calificacion_limpieza,
    calificacion_estado: r.calificacion_estado,
    calificacion_comodidad: r.calificacion_comodidad,
  };
}

export async function getResenasPropietario(id_propietario: string): Promise<{
  data: { resenas: ResenaItem[] } | null;
  error: string | null;
}> {
  try {
    const res = await fetch(`${process.env.FEEDBACK_API_URL}/api/resena/propietario/${id_propietario}`, {
      headers: await authHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      return { data: null, error: `Feedback App respondió ${res.status}` };
    }

    const json: { resenas: RawResena[] } = await res.json();
    return { data: { resenas: json.resenas.map(mapResena) }, error: null };
  } catch {
    return { data: null, error: "No se pudo contactar a Feedback App" };
  }
}

export async function getResenasVehiculo(id_vehiculo: string): Promise<{
  data: { resenas: ResenaItem[] } | null;
  error: string | null;
}> {
  try {
    const res = await fetch(`${process.env.FEEDBACK_API_URL}/api/resena/vehiculo/${id_vehiculo}`, {
      headers: await authHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      return { data: null, error: `Feedback App respondió ${res.status}` };
    }

    const json: { resenas: RawResena[] } = await res.json();
    return { data: { resenas: json.resenas.map(mapResena) }, error: null };
  } catch {
    return { data: null, error: "No se pudo contactar a Feedback App" };
  }
}

export interface ResenaVehiculoReserva {
  id_resena: string | null;
  id_reserva: string;
  id_vehiculo: string | null;
  id_emisor: string | null;
  calificacion_general: number | null;
  descripcion: string | null;
  fecha_creacion: string | null;
  calificacion_limpieza: number | null;
  calificacion_estado: number | null;
  calificacion_comodidad: number | null;
  respuesta: string | null;
}

export async function getResenaVehiculoReserva(id_reserva: string): Promise<{
  data: ResenaVehiculoReserva | null;
  error: string | null;
}> {
  try {
    const res = await fetch(`${process.env.FEEDBACK_API_URL}/api/resena/vehiculo/reserva/${id_reserva}`, {
      headers: await authHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      return { data: null, error: `Feedback App respondió ${res.status}` };
    }

    const json = await res.json();
    return {
      data: {
        id_resena: json["id_reseña"] != null ? String(json["id_reseña"]) : null,
        id_reserva,
        id_vehiculo: json.id_vehiculo != null ? String(json.id_vehiculo) : null,
        id_emisor: json.id_emisor != null ? String(json.id_emisor) : null,
        calificacion_general: json.calificacion_general ?? null,
        descripcion: json.descripcion ?? null,
        fecha_creacion: json.fecha_creacion ?? null,
        calificacion_limpieza: json.calificacion_limpieza ?? null,
        calificacion_estado: json.calificacion_estado ?? null,
        calificacion_comodidad: json.calificacion_comodidad ?? null,
        respuesta: json.respuesta ?? null,
      },
      error: null,
    };
  } catch {
    return { data: null, error: "No se pudo contactar a Feedback App" };
  }
}

export interface ResenaPropietarioReserva {
  id_resena: string | null;
  id_reserva: string;
  id_propietario: string | null;
  id_emisor: string | null;
  calificacion_general: number | null;
  descripcion: string | null;
  fecha_creacion: string | null;
  calificacion_comunicacion: number | null;
  calificacion_puntualidad: number | null;
  respuesta: string | null;
}

export async function getResenaPropietarioReserva(id_reserva: string): Promise<{
  data: ResenaPropietarioReserva | null;
  error: string | null;
}> {
  try {
    const res = await fetch(`${process.env.FEEDBACK_API_URL}/api/resena/propietario/reserva/${id_reserva}`, {
      headers: await authHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      return { data: null, error: `Feedback App respondió ${res.status}` };
    }

    const json = await res.json();
    return {
      data: {
        id_resena: json["id_reseña"] != null ? String(json["id_reseña"]) : null,
        id_reserva,
        id_propietario: json.id_propietario != null ? String(json.id_propietario) : null,
        id_emisor: json.id_emisor != null ? String(json.id_emisor) : null,
        calificacion_general: json.calificacion_general ?? null,
        descripcion: json.descripcion ?? null,
        fecha_creacion: json.fecha_creacion ?? null,
        calificacion_comunicacion: json.calificacion_comunicacion ?? null,
        calificacion_puntualidad: json.calificacion_puntualidad ?? null,
        respuesta: json.respuesta ?? null,
      },
      error: null,
    };
  } catch {
    return { data: null, error: "No se pudo contactar a Feedback App" };
  }
}

export interface ResenaAlquiladorReserva {
  id_resena: string | null;
  id_reserva: string;
  id_alquilador: string | null;
  id_emisor: string | null;
  calificacion_general: number | null;
  descripcion: string | null;
  fecha_creacion: string | null;
  calificacion_comunicacion: number | null;
  calificacion_puntualidad: number | null;
  calificacion_devolucion: number | null;
  respuesta: string | null;
}

export async function getResenaAlquiladorReserva(id_reserva: string): Promise<{
  data: ResenaAlquiladorReserva | null;
  error: string | null;
}> {
  try {
    const res = await fetch(`${process.env.FEEDBACK_API_URL}/api/resena/alquilador/reserva/${id_reserva}`, {
      headers: await authHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      return { data: null, error: `Feedback App respondió ${res.status}` };
    }

    const json = await res.json();
    return {
      data: {
        id_resena: json["id_reseña"] != null ? String(json["id_reseña"]) : null,
        id_reserva,
        id_alquilador: json.id_alquilador != null ? String(json.id_alquilador) : null,
        id_emisor: json.id_emisor != null ? String(json.id_emisor) : null,
        calificacion_general: json.calificacion_general ?? null,
        descripcion: json.descripcion ?? null,
        fecha_creacion: json.fecha_creacion ?? null,
        calificacion_comunicacion: json.calificacion_comunicacion ?? null,
        calificacion_puntualidad: json.calificacion_puntualidad ?? null,
        calificacion_devolucion: json.calificacion_devolucion ?? null,
        respuesta: json.respuesta ?? null,
      },
      error: null,
    };
  } catch {
    return { data: null, error: "No se pudo contactar a Feedback App" };
  }
}

export async function crearResena(data: {
  idReserva: string;
  idEmisor: string;
  calificacionGeneral: number;
  descripcion: string;
  // reseña sobre vehículo
  idVehiculo?: string;
  calificacionLimpieza?: number;
  calificacionEstado?: number;
  calificacionComodidad?: number;
  // reseña sobre propietario
  idPropietario?: string;
  calificacionComunicacion?: number;
  calificacionPuntualidad?: number;
  // reseña sobre alquilador
  idAlquilador?: string;
  calificacionDevolucion?: number;
}): Promise<{
  data: { id_resena: string; id_reserva: string; fecha_creacion: string; estado_moderacion: string } | null;
  error: string | null;
}> {
  const tipo_receptor: "vehiculo" | "propietario" | "alquilador" = data.idVehiculo
    ? "vehiculo"
    : data.idPropietario
    ? "propietario"
    : "alquilador";
  const id_receptor = data.idVehiculo ?? data.idPropietario ?? data.idAlquilador ?? "";

  const calificaciones: Record<string, number> = {};
  if (data.calificacionComunicacion !== undefined) calificaciones.calificacion_comunicacion = data.calificacionComunicacion;
  if (data.calificacionPuntualidad !== undefined) calificaciones.calificacion_puntualidad = data.calificacionPuntualidad;
  if (data.calificacionDevolucion !== undefined) calificaciones.calificacion_devolucion = data.calificacionDevolucion;
  if (data.calificacionLimpieza !== undefined) calificaciones.calificacion_limpieza = data.calificacionLimpieza;
  if (data.calificacionEstado !== undefined) calificaciones.calificacion_estado = data.calificacionEstado;
  if (data.calificacionComodidad !== undefined) calificaciones.calificacion_comodidad = data.calificacionComodidad;

  try {
    const res = await fetch(`${process.env.FEEDBACK_API_URL}/api/resena`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({
        id_reserva: data.idReserva,
        id_emisor: data.idEmisor,
        id_receptor,
        tipo_receptor,
        calificacion_general: data.calificacionGeneral,
        descripcion: data.descripcion,
        calificaciones,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      return { data: null, error: `Feedback App respondió ${res.status}` };
    }

    const json = await res.json();
    return {
      data: {
        id_resena: String(json["id_reseña"]),
        id_reserva: String(json.id_reserva),
        fecha_creacion: json.fecha_creacion,
        estado_moderacion: json.estado_moderacion,
      },
      error: null,
    };
  } catch {
    return { data: null, error: "No se pudo contactar a Feedback App" };
  }
}

export async function responderResena(data: {
  id_resena: string;
  id_propietario: string;
  respuesta: string;
}): Promise<{
  data: { id_resena: string; id_autor: string; comentario: string; fecha_creacion: string } | null;
  error: string | null;
}> {
  try {
    const res = await fetch(`${process.env.FEEDBACK_API_URL}/api/respuesta`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({
        ["id_reseña"]: data.id_resena,
        id_autor: data.id_propietario,
        comentario: data.respuesta,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      return { data: null, error: `Feedback App respondió ${res.status}` };
    }

    const json = await res.json();
    return {
      data: {
        id_resena: String(json["id_reseña"]),
        id_autor: String(json.id_autor),
        comentario: json.comentario,
        fecha_creacion: json.fecha_creacion,
      },
      error: null,
    };
  } catch {
    return { data: null, error: "No se pudo contactar a Feedback App" };
  }
}

export async function getResumenPropietario(id_propietario: string): Promise<{
  data: { id_propietario: string; resumen: string } | null;
  error: string | null;
}> {
  try {
    const res = await fetch(`${process.env.FEEDBACK_API_URL}/api/resumen/propietario/${id_propietario}`, {
      headers: await authHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      return { data: null, error: `Feedback App respondió ${res.status}` };
    }

    const json = await res.json();
    return { data: json, error: null };
  } catch {
    return { data: null, error: "No se pudo contactar a Feedback App" };
  }
}

export async function getResumenVehiculo(id_vehiculo: string): Promise<{
  data: { id_vehiculo: string; resumen: string } | null;
  error: string | null;
}> {
  try {
    const res = await fetch(`${process.env.FEEDBACK_API_URL}/api/resumen/vehiculo/${id_vehiculo}`, {
      headers: await authHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      return { data: null, error: `Feedback App respondió ${res.status}` };
    }

    const json = await res.json();
    return { data: json, error: null };
  } catch {
    return { data: null, error: "No se pudo contactar a Feedback App" };
  }
}

export async function getPromedioPropietario(id_propietario: string): Promise<{
  data: { id_propietario: string; calificacion_promedio: number; cantidad_resenas: number } | null;
  error: string | null;
}> {
  try {
    const res = await fetch(`${process.env.FEEDBACK_API_URL}/api/promedio/propietario/${id_propietario}`, {
      headers: await authHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      return { data: null, error: `Feedback App respondió ${res.status}` };
    }

    const json = await res.json();
    return { data: json, error: null };
  } catch {
    return { data: null, error: "No se pudo contactar a Feedback App" };
  }
}

export async function getPromedioVehiculo(id_vehiculo: string): Promise<{
  data: { id_vehiculo: string; calificacion_promedio: number; cantidad_resenas: number } | null;
  error: string | null;
}> {
  try {
    const res = await fetch(`${process.env.FEEDBACK_API_URL}/api/promedio/vehiculo/${id_vehiculo}`, {
      headers: await authHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      return { data: null, error: `Feedback App respondió ${res.status}` };
    }

    const json = await res.json();
    return { data: json, error: null };
  } catch {
    return { data: null, error: "No se pudo contactar a Feedback App" };
  }
}
