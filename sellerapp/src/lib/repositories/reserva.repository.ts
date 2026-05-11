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