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
  idResena: string | number;
  idReserva: string | number;
  idEmisor: string | number;
  calificacionGeneral: number;
  descripcion: string;
  fechaCreacion: string;
  calificacionComunicacion?: number;
  calificacionPuntualidad?: number;
  calificacionDevolucion?: number;
  calificacionLimpieza?: number;
  calificacionEstado?: number;
  calificacionComodidad?: number;
}

function mapResena(r: RawResena): ResenaItem {
  return {
    id_resena: String(r.idResena),
    id_reserva: String(r.idReserva),
    id_emisor: String(r.idEmisor),
    calificacion_general: r.calificacionGeneral,
    descripcion: r.descripcion,
    fecha_creacion: r.fechaCreacion,
    calificacion_comunicacion: r.calificacionComunicacion,
    calificacion_puntualidad: r.calificacionPuntualidad,
    calificacion_devolucion: r.calificacionDevolucion,
    calificacion_limpieza: r.calificacionLimpieza,
    calificacion_estado: r.calificacionEstado,
    calificacion_comodidad: r.calificacionComodidad,
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
        id_resena: json.idResena != null ? String(json.idResena) : null,
        id_reserva,
        id_vehiculo: json.idVehiculo != null ? String(json.idVehiculo) : null,
        id_emisor: json.idEmisor != null ? String(json.idEmisor) : null,
        calificacion_general: json.calificacionGeneral ?? null,
        descripcion: json.descripcion ?? null,
        fecha_creacion: json.fechaCreacion ?? null,
        calificacion_limpieza: json.calificacionLimpieza ?? null,
        calificacion_estado: json.calificacionEstado ?? null,
        calificacion_comodidad: json.calificacionComodidad ?? null,
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
        id_resena: json.idResena != null ? String(json.idResena) : null,
        id_reserva,
        id_propietario: json.idPropietario != null ? String(json.idPropietario) : null,
        id_emisor: json.idEmisor != null ? String(json.idEmisor) : null,
        calificacion_general: json.calificacionGeneral ?? null,
        descripcion: json.descripcion ?? null,
        fecha_creacion: json.fechaCreacion ?? null,
        calificacion_comunicacion: json.calificacionComunicacion ?? null,
        calificacion_puntualidad: json.calificacionPuntualidad ?? null,
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
        id_resena: json.idResena != null ? String(json.idResena) : null,
        id_reserva,
        id_alquilador: json.idAlquilador != null ? String(json.idAlquilador) : null,
        id_emisor: json.idEmisor != null ? String(json.idEmisor) : null,
        calificacion_general: json.calificacionGeneral ?? null,
        descripcion: json.descripcion ?? null,
        fecha_creacion: json.fechaCreacion ?? null,
        calificacion_comunicacion: json.calificacionComunicacion ?? null,
        calificacion_puntualidad: json.calificacionPuntualidad ?? null,
        calificacion_devolucion: json.calificacionDevolucion ?? null,
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
  const tipoReceptor: "vehiculo" | "propietario" | "alquilador" = data.idVehiculo
    ? "vehiculo"
    : data.idPropietario
    ? "propietario"
    : "alquilador";
  const idReceptor = data.idVehiculo ?? data.idPropietario ?? data.idAlquilador ?? "";

  const body: Record<string, unknown> = {
    idReserva: data.idReserva,
    idEmisor: data.idEmisor,
    idReceptor,
    tipoReceptor,
    calificacionGeneral: data.calificacionGeneral,
    descripcion: data.descripcion,
  };
  if (data.calificacionComunicacion !== undefined) body.calificacionComunicacion = data.calificacionComunicacion;
  if (data.calificacionPuntualidad !== undefined) body.calificacionPuntualidad = data.calificacionPuntualidad;
  if (data.calificacionDevolucion !== undefined) body.calificacionDevolucion = data.calificacionDevolucion;
  if (data.calificacionLimpieza !== undefined) body.calificacionLimpieza = data.calificacionLimpieza;
  if (data.calificacionEstado !== undefined) body.calificacionEstado = data.calificacionEstado;
  if (data.calificacionComodidad !== undefined) body.calificacionComodidad = data.calificacionComodidad;

  try {
    const res = await fetch(`${process.env.FEEDBACK_API_URL}/api/resena`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!res.ok) {
      return { data: null, error: `Feedback App respondió ${res.status}` };
    }

    const json = await res.json();
    return {
      data: {
        id_resena: String(json.idResena),
        id_reserva: String(json.idReserva),
        fecha_creacion: json.fechaCreacion,
        estado_moderacion: json.estadoModeracion,
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
        idResena: data.id_resena,
        idAutor: data.id_propietario,
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
        id_resena: String(json.idResena),
        id_autor: String(json.idAutor),
        comentario: json.comentario,
        fecha_creacion: json.fechaCreacion,
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
    return { data: { id_propietario, resumen: json.resumen }, error: null };
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
    return { data: { id_vehiculo, resumen: json.resumen }, error: null };
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
    return {
      data: {
        id_propietario,
        calificacion_promedio: json.calificacionPromedio,
        cantidad_resenas: json.cantidadResenas,
      },
      error: null,
    };
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
    return {
      data: {
        id_vehiculo,
        calificacion_promedio: json.calificacionPromedio,
        cantidad_resenas: json.cantidadResenas,
      },
      error: null,
    };
  } catch {
    return { data: null, error: "No se pudo contactar a Feedback App" };
  }
}
