import { db } from "@/lib/db";

const VEHICULO_SELECT = {
  id_vehiculo: true,
  id_propietario: true,
  marca: true,
  modelo: true,
  anio: true,
  precio: true,
  fotos: true,
  estado: true,
};

export async function findVehiculosDisponibles() {
  return db.vehiculo.findMany({ select: VEHICULO_SELECT });
}

export async function findVehiculoById(id: string) {
  return db.vehiculo.findUnique({
    where: { id_vehiculo: id },
    select: VEHICULO_SELECT,
  });
}

export async function findVehiculosByPropietario(id_propietario: string) {
  return db.vehiculo.findMany({
    where: { id_propietario },
    select: VEHICULO_SELECT,
  });
}

export async function createVehiculo(data: {
  id_propietario: string;
  marca: string;
  modelo: string;
  anio: number;
  precio: number;
  fotos: string[];
  estado?: "Disponible" | "Alquilado";
}) {
  return db.vehiculo.create({ data, select: VEHICULO_SELECT });
}

export async function updateVehiculo(id: string, data: {
  marca?: string;
  modelo?: string;
  anio?: number;
  precio?: number;
  fotos?: string[];
  estado?: "Disponible" | "Alquilado";
}) {
  return db.vehiculo.update({
    where: { id_vehiculo: id },
    data,
    select: VEHICULO_SELECT,
  });
}