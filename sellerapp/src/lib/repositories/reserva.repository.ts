import { db } from "@/lib/db";
import { EstadoReserva } from "@prisma/client";

const RESERVA_SELECT = {
  id_reserva: true,
  id_vehiculo: true,
  id_propietario: true,
  id_alquilador: true,
  fecha_inicio: true,
  fecha_final: true,
  estado: true,
};

export async function findReservaById(id: string) {
  return db.reserva.findUnique({
    where: { id_reserva: id },
    select: RESERVA_SELECT,
  });
}

export async function createReserva(data: {
  id_alquilador: string;
  id_vehiculo: string;
  id_propietario: string;
  fecha_inicio: Date;
  fecha_final: Date;
}) {
  return db.reserva.create({ data, select: RESERVA_SELECT });
}

export async function updateReservaEstado(id: string, estado: EstadoReserva) {
  return db.reserva.update({
    where: { id_reserva: id },
    data: { estado },
    select: RESERVA_SELECT,
  });
}

export async function findReservasByPropietario(id_propietario: string) {
  return db.reserva.findMany({
    where: { id_propietario },
    orderBy: { createdAt: "desc" },
    select: RESERVA_SELECT,
  });
}

export async function findReservasByAlquilador(id_alquilador: string) {
  return db.reserva.findMany({
    where: { id_alquilador },
    orderBy: { createdAt: "desc" },
    select: RESERVA_SELECT,
  });
}