import { db } from "@/lib/db";

const PROPIETARIO_SELECT = {
  id_propietario: true,
  email: true,
  nombre: true,
  apellido: true,
  fecha_nacimiento: true,
  dni: true,
  direccion: true,
  telefono: true,
};

export async function findPropietarioById(id: string) {
  return db.propietario.findUnique({
    where: { id_propietario: id },
    select: PROPIETARIO_SELECT,
  });
}

export async function findAllPropietarios() {
  return db.propietario.findMany({
    select: PROPIETARIO_SELECT,
  });
}

export async function createPropietario(data: {
  email: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: Date;
  dni: string;
  direccion: string;
  telefono: string;
}) {
  return db.propietario.create({ data, select: PROPIETARIO_SELECT });
}

export async function updatePropietario(id: string, data: {
  nombre?: string;
  apellido?: string;
  fecha_nacimiento?: Date;
  dni?: string;
  direccion?: string;
  email?: string;
  telefono?: string;
}) {
  return db.propietario.update({
    where: { id_propietario: id },
    data,
    select: PROPIETARIO_SELECT,
  });
}