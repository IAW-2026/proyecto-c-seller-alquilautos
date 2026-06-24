"use server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { EstadoReserva, Prisma } from "@prisma/client";
import { daysBetween } from "@/lib/utils";

async function verificarAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("No autorizado");
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  if (role !== "adminSeller") throw new Error("No autorizado");
}

const ESTADOS_ACTIVOS: EstadoReserva[] = [
  EstadoReserva.Pendiente,
  EstadoReserva.Aceptada,
  EstadoReserva.Coordinada,
  EstadoReserva.Pagada,
  EstadoReserva.Entregada,
];

const ESTADOS_ALQUILADO: EstadoReserva[] = [
  EstadoReserva.Aceptada,
  EstadoReserva.Coordinada,
  EstadoReserva.Pagada,
  EstadoReserva.Entregada,
];

const ESTADOS_DISPONIBLE: EstadoReserva[] = [
  EstadoReserva.Finalizada,
  EstadoReserva.Rechazada,
  EstadoReserva.Cancelada,
];

// ===== PROPIETARIOS =====

export async function eliminarPropietarioAction(id_propietario: string) {
  await verificarAdmin();

  const reservasActivas = await db.reserva.count({
    where: { id_propietario, estado: { in: ESTADOS_ACTIVOS } },
  });

  if (reservasActivas > 0) {
    return { error: "El propietario tiene reservas activas. Esperá a que finalicen." };
  }

  await db.reserva.deleteMany({ where: { id_propietario } });
  await db.vehiculo.deleteMany({ where: { id_propietario } });
  await db.propietario.delete({ where: { id_propietario } });

  revalidatePath("/admin/propietarios");
  return { data: "Propietario eliminado correctamente" };
}

export async function actualizarPropietarioAdminAction(id_propietario: string, data: {
  nombre?: string;
  apellido?: string;
  email?: string;
  dni?: string;
  direccion?: string;
  telefono?: string;
}) {
  await verificarAdmin();

  try {
    await db.propietario.update({
      where: { id_propietario },
      data,
    });
    revalidatePath("/admin/propietarios");
    return { data: "Propietario actualizado correctamente" };
  } catch {
    return { error: "Error al actualizar el propietario" };
  }
}

export async function exportarPropietariosAction(filtros: { q?: string }) {
  await verificarAdmin();

  const { q } = filtros;
  const where: Prisma.PropietarioWhereInput = q ? {
    OR: [
      { nombre:   { contains: q, mode: "insensitive" } },
      { apellido: { contains: q, mode: "insensitive" } },
      { email:    { contains: q, mode: "insensitive" } },
      { dni:      { contains: q, mode: "insensitive" } },
    ],
  } : {};

  try {
    const propietarios = await db.propietario.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        nombre: true,
        apellido: true,
        email: true,
        dni: true,
        direccion: true,
        telefono: true,
        _count: { select: { vehiculos: true } },
        reservas: {
          where: { estado: "Finalizada" },
          select: { fecha_inicio: true, fecha_final: true, vehiculo: { select: { precio: true } } },
        },
      },
    });

    const data = propietarios.map(p => {
      const ingresosTotales = p.reservas.reduce(
        (acc, r) => acc + Number(r.vehiculo.precio) * daysBetween(r.fecha_inicio, r.fecha_final),
        0
      );
      return {
        "Nombre":                        p.nombre,
        "Apellido":                      p.apellido,
        "Email":                         p.email,
        "DNI":                           p.dni,
        "Dirección":                     p.direccion,
        "Teléfono":                      p.telefono ?? "",
        "Cantidad Vehículos":            p._count.vehiculos,
        "Cantidad Reservas Finalizadas": p.reservas.length,
        "Ingresos Totales":              ingresosTotales,
      };
    });

    return { data };
  } catch {
    return { error: "Error al generar el archivo de propietarios" };
  }
}

// ===== VEHICULOS =====

export async function eliminarVehiculoAction(id_vehiculo: string) {
  await verificarAdmin();

  const reservasActivas = await db.reserva.count({
    where: { id_vehiculo, estado: { in: ESTADOS_ACTIVOS } },
  });

  if (reservasActivas > 0) {
    return { error: "El vehículo tiene reservas activas. Esperá a que finalicen." };
  }

  await db.reserva.deleteMany({ where: { id_vehiculo } });
  await db.vehiculo.delete({ where: { id_vehiculo } });

  revalidatePath("/admin/vehiculos");
  return { data: "Vehículo eliminado correctamente" };
}

export async function actualizarVehiculoAdminAction(id_vehiculo: string, data: {
  marca?: string;
  modelo?: string;
  anio?: number;
  precio?: number;
  fotos?: string;
  estado?: "Disponible" | "Alquilado";
}) {
  await verificarAdmin();

  try {
    await db.vehiculo.update({
      where: { id_vehiculo },
      data,
    });
    revalidatePath("/admin/vehiculos");
    return { data: "Vehículo actualizado correctamente" };
  } catch {
    return { error: "Error al actualizar el vehículo" };
  }
}

// ===== RESERVAS =====

export async function eliminarReservaAction(id_reserva: string) {
  await verificarAdmin();

  try {
    await db.reserva.delete({ where: { id_reserva } });
    revalidatePath("/admin/reservas");
    return { data: "Reserva eliminada correctamente" };
  } catch {
    return { error: "Error al eliminar la reserva" };
  }
}

export async function exportarReservasAction(filtros: {
  estado?: string;
  propietario?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  alquilador?: string;
}) {
  await verificarAdmin();

  const { estado, propietario, fechaDesde, fechaHasta, alquilador } = filtros;
  const where: Prisma.ReservaWhereInput = {
    ...(estado && estado !== "Todos" && { estado: estado as EstadoReserva }),
    ...(propietario && { id_propietario: propietario }),
    ...(alquilador && { id_alquilador: { contains: alquilador, mode: "insensitive" } }),
    ...((fechaDesde || fechaHasta) && {
      fecha_inicio: {
        ...(fechaDesde && { gte: new Date(fechaDesde) }),
        ...(fechaHasta && { lte: new Date(`${fechaHasta}T23:59:59.999`) }),
      },
    }),
  };

  try {
    const reservas = await db.reserva.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { vehiculo: true, propietario: true },
    });

    const data = reservas.map(r => {
      const dias = daysBetween(r.fecha_inicio, r.fecha_final);
      const precioDia = Number(r.vehiculo.precio);
      return {
        "ID Reserva":    r.id_reserva,
        "Estado":        r.estado,
        "Propietario":   `${r.propietario.nombre} ${r.propietario.apellido}`,
        "Vehículo":      `${r.vehiculo.marca} ${r.vehiculo.modelo}`,
        "ID Alquilador": r.id_alquilador,
        "Fecha Inicio":  r.fecha_inicio.toISOString().slice(0, 10),
        "Fecha Final":   r.fecha_final.toISOString().slice(0, 10),
        "Días":          dias,
        "Precio/Día":    precioDia,
        "Total ARS":     precioDia * dias,
      };
    });

    return { data };
  } catch {
    return { error: "Error al generar el archivo de reservas" };
  }
}

// ===== SIMULADOR ===== se borra para etapa 3
export async function cambiarEstadoReservaAction(id_reserva: string, estado: EstadoReserva) {
  await verificarAdmin();

  try {
    const reserva = await db.reserva.update({
      where: { id_reserva },
      data: { estado },
    });

    if (ESTADOS_ALQUILADO.includes(estado)) {
      await db.vehiculo.update({
        where: { id_vehiculo: reserva.id_vehiculo },
        data: { estado: "Alquilado" },
      });
    } else if (ESTADOS_DISPONIBLE.includes(estado)) {
      await db.vehiculo.update({
        where: { id_vehiculo: reserva.id_vehiculo },
        data: { estado: "Disponible" },
      });
    }

    revalidatePath("/admin/simulador");
    revalidatePath("/dashboard/vehiculos");
    revalidatePath("/dashboard");
    return { data: { id_reserva, estado } };
  } catch {
    return { error: "Error al cambiar el estado" };
  }
}