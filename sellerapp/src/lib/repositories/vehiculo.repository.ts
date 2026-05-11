import { db } from "@/lib/db";

export async function findVehiculosDisponibles() {
  return db.vehiculo.findMany();
}

export async function findVehiculoById(id: string) {
  return db.vehiculo.findUnique({
    where: { id_vehiculo: id },
  });
}

export async function findVehiculosByPropietario(id_propietario: string) {
  return db.vehiculo.findMany({
    where: { id_propietario },
  });
}