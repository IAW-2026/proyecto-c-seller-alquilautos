"use server";
import { auth } from "@clerk/nextjs/server";
import { crearVehiculo, actualizarVehiculo } from "@/lib/services/vehiculo.service";
import { crearVehiculoSchema, actualizarVehiculoSchema } from "@/lib/validators/vehiculo";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function crearVehiculoAction(formData: {
  marca: string;
  modelo: string;
  anio: number;
  precio: number;
  fotos: string;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("No autorizado");

  const metadata = sessionClaims?.publicMetadata as { role?: string; id_propietario?: string };
  if (metadata?.role !== "propietario" && metadata?.role !== "adminSeller") throw new Error("No autorizado");
  if (!metadata?.id_propietario) throw new Error("Propietario no encontrado");

  const validation = crearVehiculoSchema.safeParse(formData);
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors };
  }

  const result = await crearVehiculo(metadata.id_propietario, validation.data);
  if (result.error) return { error: result.error };

  revalidatePath("/dashboard/vehiculos");
  revalidatePath("/dashboard");
  return { data: result.data };
}

export async function actualizarVehiculoAction(id: string, formData: {
  marca?: string;
  modelo?: string;
  anio?: number;
  precio?: number;
  fotos?: string;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("No autorizado");

  const metadata = sessionClaims?.publicMetadata as { role?: string };
  if (metadata?.role !== "propietario" && metadata?.role !== "adminSeller") throw new Error("No autorizado");

  const validation = actualizarVehiculoSchema.safeParse(formData);
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors };
  }

  const result = await actualizarVehiculo(id, validation.data);
  if (result.error) return { error: result.error };

  revalidatePath("/dashboard/vehiculos");
  revalidatePath(`/dashboard/vehiculos/${id}`);
  return { data: result.data };
}

export async function eliminarVehiculoAction(id_vehiculo: string) {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("No autorizado");

  const metadata = sessionClaims?.publicMetadata as { role?: string; id_propietario?: string };
  if (metadata?.role !== "propietario" && metadata?.role !== "adminSeller") throw new Error("No autorizado");

  const reservasActivas = await db.reserva.count({
    where: {
      id_vehiculo,
      estado: { in: ["Pendiente", "Aceptada", "Coordinada", "Pagada", "Entregada"] },
    },
  });

  if (reservasActivas > 0) {
    return { error: "El vehículo tiene reservas activas. Esperá a que finalicen." };
  }

  await db.reserva.deleteMany({ where: { id_vehiculo } });
  await db.vehiculo.delete({ where: { id_vehiculo } });

  revalidatePath("/dashboard/vehiculos");
  return { data: "Vehículo eliminado correctamente" };
}