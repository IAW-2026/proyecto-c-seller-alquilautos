import { db } from "@/lib/db";
import { EstadoReserva } from "@prisma/client";

export async function findReservaById(id: string) {
  return db.reserva.findUnique({
    where: { id_reserva: id },
  });
}

export async function createReserva(data: {
  id_alquilador: string;
  id_vehiculo: string;
  id_propietario: string;
  fecha_inicio: Date;
  fecha_final: Date;
}) {
  return db.reserva.create({ data });
}

export async function updateReservaEstado(id: string, estado: "Aceptada" | "Rechazada") {
  return db.reserva.update({
    where: { id_reserva: id },
    data: { estado },
  });
}

export async function findReservasByPropietario(id_propietario: string) {
  return db.reserva.findMany({
    where: { id_propietario },
    orderBy: { createdAt: "desc" },
  });
}