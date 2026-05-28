export async function getResenasAlquilador(id_alquilador: string) {
  return {
    resenas: [
      {
        id_resena: 1,
        id_reserva: 100,
        id_emisor: 2,
        calificacion_general: 5,
        descripcion: "Muy buen cliente",
        fecha_creacion: "01-06-2026",
        calificacion_comunicacion: 4,
        calificacion_puntualidad: 4,
        calificacion_devolucion: 4,
      },
    ],
  };
}

export async function getResenasPropietario(id_propietario: string) {
  return {
    resenas: [
      {
        id_resena: 2,
        id_reserva: 100,
        id_emisor: 1,
        calificacion_general: 4,
        descripcion: "Buen servicio",
        fecha_creacion: "02-06-2026",
        calificacion_comunicacion: 4,
        calificacion_puntualidad: 4,
      },
    ],
  };
}

export async function getResenasVehiculo(id_vehiculo: string) {
  return {
    resenas: [
      {
        id_resena: 3,
        id_reserva: 100,
        id_emisor: 1,
        calificacion_general: 5,
        descripcion: "Auto impecable",
        fecha_creacion: "03-06-2026",
        calificacion_limpieza: 4,
        calificacion_estado: 4,
        calificacion_comodidad: 4,
      },
      {
        id_resena: 4,
        id_reserva: 101,
        id_emisor: 2,
        calificacion_general: 4,
        descripcion: "Muy cómodo para viajes largos.",
        fecha_creacion: "10-06-2026",
        calificacion_limpieza: 4,
        calificacion_estado: 5,
        calificacion_comodidad: 4,
      },
      {
        id_resena: 5,
        id_reserva: 102,
        id_emisor: 3,
        calificacion_general: 5,
        descripcion: "Excelente estado, tanque lleno.",
        fecha_creacion: "15-06-2026",
        calificacion_limpieza: 5,
        calificacion_estado: 5,
        calificacion_comodidad: 5,
      },
      {
        id_resena: 6,
        id_reserva: 103,
        id_emisor: 4,
        calificacion_general: 3,
        descripcion: "Bien pero le faltaba nafta.",
        fecha_creacion: "20-06-2026",
        calificacion_limpieza: 3,
        calificacion_estado: 3,
        calificacion_comodidad: 4,
      },
      {
        id_resena: 7,
        id_reserva: 104,
        id_emisor: 5,
        calificacion_general: 5,
        descripcion: "Perfecto, lo recomiendo.",
        fecha_creacion: "25-06-2026",
        calificacion_limpieza: 5,
        calificacion_estado: 5,
        calificacion_comodidad: 5,
      },
      {
        id_resena: 8,
        id_reserva: 105,
        id_emisor: 6,
        calificacion_general: 4,
        descripcion: "Buena experiencia en general.",
        fecha_creacion: "28-06-2026",
        calificacion_limpieza: 4,
        calificacion_estado: 4,
        calificacion_comodidad: 4,
      },
    ],
  };
}

export async function getResenaVehiculoReserva(id_reserva: string) {
  return {
    id_resena: 3,
    id_reserva,
    id_vehiculo: "vehiculo_1",
    id_emisor: 1,
    calificacion_general: 5,
    descripcion: "Auto impecable",
    fecha_creacion: "06-06-2026",
    calificacion_limpieza: 5,
    calificacion_estado: 5,
    calificacion_comodidad: 4,
    respuesta: null as string | null,
  };
}

export async function getResenaPropietarioReserva(id_reserva: string) {
  return {
    id_resena: 2,
    id_reserva,
    id_propietario: "propietario_1",
    id_emisor: 1,
    calificacion_general: 4,
    descripcion: "Buen servicio",
    fecha_creacion: "06-06-2026",
    calificacion_comunicacion: 4,
    calificacion_puntualidad: 4,
    respuesta: null as string | null,
  };
}

export async function getResenaAlquiladorReserva(id_reserva: string) {
  return {
    id_resena: 1,
    id_reserva,
    id_alquilador: "alquilador_1",
    id_emisor: 2,
    calificacion_general: null as number | null,
    descripcion: null as string | null,
    fecha_creacion: null as string | null,
    calificacion_comunicacion: null as number | null,
    calificacion_puntualidad: null as number | null,
    calificacion_devolucion: null as number | null,
    respuesta: null as string | null,
  };
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
}) {
  return { id_resena: `resena_nueva_${data.idReserva}` };
}

export async function responderResena(data: {
  id_resena: string;
  id_propietario: string;
  respuesta: string;
}) {
  return { id_resena: data.id_resena, respuesta: data.respuesta };
}

export async function getResumenPropietario(id_propietario: string) {
  return {
    id_propietario,
    resumen: "Resumen generado a partir de reseñas",
  };
}

export async function getResumenAlquilador(id_alquilador: string) {
  return {
    id_alquilador,
    resumen: "Resumen generado a partir de reseñas",
  };
}

export async function getResumenVehiculo(id_vehiculo: string) {
  return {
    id_vehiculo,
    resumen: "Resumen generado a partir de reseñas",
  };
}

export async function getPromedioPropietario(id_propietario: string) {
  return {
    id_propietario,
    calificacion_promedio: 4.2,
    cantidad_resenas: 8,
  };
}

export async function getPromedioVehiculo(id_vehiculo: string) {
  return {
    id_vehiculo,
    calificacion_promedio: 4.8,
    cantidad_resenas: 15,
  };
}

export async function getPromedioAlquilador(id_alquilador: string) {
  return {
    id_alquilador,
    calificacion_promedio: 4.5,
    cantidad_resenas: 10,
  };
}