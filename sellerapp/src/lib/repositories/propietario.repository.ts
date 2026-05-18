import { db } from "@/lib/db";

export async function findPropietarioById(id: string) {
  return db.propietario.findUnique({
    where: { id_propietario: id },
  });
}

export async function createPropietario(data: {
  email: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: Date;
  dni: string;
  direccion: string;
}) {
  return db.propietario.create({ data });
}

export async function updatePropietario(id: string, data: {
  nombre?: string;
  apellido?: string;
  fecha_nacimiento?: Date;
  dni?: string;
  direccion?: string;
  email?: string;
}) {
  return db.propietario.update({
    where: { id_propietario: id },
    data,
  });
}