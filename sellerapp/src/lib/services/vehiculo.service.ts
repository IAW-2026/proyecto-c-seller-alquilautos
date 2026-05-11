import {
  findVehiculosDisponibles,
  findVehiculoById,
  findVehiculosByPropietario,
} from "@/lib/repositories/vehiculo.repository";

export async function getVehiculosDisponibles() {
  const vehiculos = await findVehiculosDisponibles();
  return { data: { vehiculos }, error: null };
}

export async function getVehiculo(id: string) {
  const vehiculo = await findVehiculoById(id);

  if (!vehiculo) {
    return { data: null, error: "Vehículo no encontrado" };
  }

  return { data: vehiculo, error: null };
}

export async function getVehiculosByPropietario(id_propietario: string) {
  const propietario = await findVehiculosByPropietario(id_propietario);
  return { data: { vehiculos: propietario }, error: null };
}