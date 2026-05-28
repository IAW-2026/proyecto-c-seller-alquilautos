export async function createEntrega(data: {
  id_reserva: string;
  id_vehiculo: string;
  id_propietario: string;
  id_alquilador: string;
  hora_inicio_entrega: string;
  hora_fin_entrega: string;
  hora_inicio_devolucion: string;
  hora_fin_devolucion: string;
}) {
  return {
    id_entrega: `entrega_${data.id_reserva}`,
    id_reserva: data.id_reserva,
    estado: "Pendiente",
  };
}

export async function getEntrega(id: string) {
  return {
    id_entrega: id,
    estado: "Pendiente",
    direccion_entrega: "Av. Corrientes 1234, Buenos Aires",
  };
}

export async function getHorarioSeleccionado(id_reserva: string) {
  return {
    id_reserva,
    hora_inicio_entrega: "08:00",
    hora_fin_entrega: "12:00",
    hora_inicio_devolucion: "14:00",
    hora_fin_devolucion: "20:00",
  };
}

export async function cancelarEntrega(id_reserva: string) {
  return {
    id_reserva,
    estado: "Cancelada",
  };
}

