import {
  findVehiculosDisponibles,
  findVehiculoById,
  findVehiculosByPropietario,
} from "@/lib/repositories/vehiculo.repository";

import { createVehiculo, updateVehiculo } from "@/lib/repositories/vehiculo.repository";
import type { CrearVehiculoInput, ActualizarVehiculoInput } from "@/lib/validators/vehiculo";


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

export async function crearVehiculo(id_propietario: string, input: CrearVehiculoInput) {
  const vehiculo = await createVehiculo({
    id_propietario,
    ...input,
  });
  return { data: vehiculo, error: null };
}

export async function actualizarVehiculo(id: string, input: ActualizarVehiculoInput) {
  const existente = await findVehiculoById(id);
  if (!existente) {
    return { data: null, error: "Vehículo no encontrado" };
  }

  const vehiculo = await updateVehiculo(id, input);
  return { data: vehiculo, error: null };
}