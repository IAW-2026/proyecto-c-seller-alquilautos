"use server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { EstadoReserva } from "@prisma/client";

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