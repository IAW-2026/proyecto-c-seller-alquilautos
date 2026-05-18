export async function getResenasPropietario(id_propietario: string) {
  return [
    {
      id_resena: "resena_001",
      id_propietario,
      comentario: "Excelente propietario, muy atento.",
      puntuacion: 5,
    },
    {
      id_resena: "resena_002",
      id_propietario,
      comentario: "Buena experiencia en general.",
      puntuacion: 4,
    },
  ];
}

export async function getResenasVehiculo(id_vehiculo: string) {
  return [
    {
      id_resena: "resena_003",
      id_vehiculo,
      comentario: "El auto estaba en perfectas condiciones.",
      puntuacion: 5,
    },
    {
      id_resena: "resena_004",
      id_vehiculo,
      comentario: "Muy cómodo para viajes largos.",
      puntuacion: 4,
    },
  ];
}

export async function getPromedioPropietario(id_propietario: string) {
  return {
    id_propietario,
    promedio: 4.5,
    total_resenas: 2,
  };
}

export async function getPromedioVehiculo(id_vehiculo: string) {
  return {
    id_vehiculo,
    promedio: 4.5,
    total_resenas: 2,
  };
}