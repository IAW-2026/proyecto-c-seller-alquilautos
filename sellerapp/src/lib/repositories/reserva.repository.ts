import { db } from "@/lib/db";
import { EstadoReserva, Prisma } from "@prisma/client";

export interface ReservaFiltros {
  estados?: EstadoReserva[];
  id_vehiculo?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

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

const ESTADOS_FINALIZADOS_NO_RELEVANTES: EstadoReserva[] = [EstadoReserva.Cancelada, EstadoReserva.Rechazada, EstadoReserva.Finalizada];

export async function findReservasByPropietario(id_propietario: string, filtros?: ReservaFiltros) {
  const where: Prisma.ReservaWhereInput = { id_propietario };

  if (filtros?.estados?.length) where.estado = { in: filtros.estados };
  else where.estado = { notIn: ESTADOS_FINALIZADOS_NO_RELEVANTES };
  if (filtros?.id_vehiculo) where.id_vehiculo = filtros.id_vehiculo;
  if (filtros?.fechaDesde || filtros?.fechaHasta) {
    where.fecha_inicio = {
      ...(filtros.fechaDesde && { gte: filtros.fechaDesde }),
      ...(filtros.fechaHasta && { lte: filtros.fechaHasta }),
    };
  }

  return db.reserva.findMany({
    where,
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

export async function countPendientesUrgentesByPropietario(id_propietario: string, antes: Date) {
  return db.reserva.count({
    where: {
      id_propietario,
      estado: EstadoReserva.Pendiente,
      createdAt: { lt: antes },
    },
  });
}