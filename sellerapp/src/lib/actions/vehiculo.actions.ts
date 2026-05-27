"use server";
import { auth } from "@clerk/nextjs/server";
import { crearVehiculo, actualizarVehiculo } from "@/lib/services/vehiculo.service";
import { crearVehiculoSchema, actualizarVehiculoSchema } from "@/lib/validators/vehiculo";
import { revalidatePath } from "next/cache";

export async function crearVehiculoAction(formData: {
  marca: string;
  modelo: string;
  precio: number;
  ubicacion: string;
  fotos: string[];
  estado: "Disponible" | "Alquilado";
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("No autorizado");

  const metadata = sessionClaims?.publicMetadata as { role?: string; id_propietario?: string };
  if (metadata?.role !== "propietario") throw new Error("No autorizado");
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
  precio?: number;
  ubicacion?: string;
  fotos?: string[];
  estado?: "Disponible" | "Alquilado";
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("No autorizado");

  const metadata = sessionClaims?.publicMetadata as { role?: string };
  if (metadata?.role !== "propietario") throw new Error("No autorizado");

  const validation = actualizarVehiculoSchema.safeParse(formData);
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors };
  }

  const result = await actualizarVehiculo(id, validation.data);
  if (result.error) return { error: result.error };

  revalidatePath("/dashboard/vehiculos");
  revalidatePath(`/dashboard/vehiculos/${id}/editar`);
  return { data: result.data };
}