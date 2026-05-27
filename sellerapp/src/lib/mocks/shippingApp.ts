export async function createEntrega(data: {
  id_reserva: string;
  id_vehiculo: string;
  id_propietario: string;
  id_alquilador: string;
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
    hora_inicio: "10:00",
    hora_fin: "18:00",
  };
}