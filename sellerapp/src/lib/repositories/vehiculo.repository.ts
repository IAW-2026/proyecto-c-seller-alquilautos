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

export async function createVehiculo(data: {
  id_propietario: string;
  marca: string;
  modelo: string;
  precio: number;
  ubicacion: string;
  fotos: string[];
  estado?: "Disponible" | "Alquilado";
}) {
  return db.vehiculo.create({ data });
}

export async function updateVehiculo(id: string, data: {
  marca?: string;
  modelo?: string;
  precio?: number;
  ubicacion?: string;
  fotos?: string[];
  estado?: "Disponible" | "Alquilado";
}) {
  return db.vehiculo.update({
    where: { id_vehiculo: id },
    data,
  });
}