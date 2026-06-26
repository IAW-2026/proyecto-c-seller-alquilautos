"use server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { actualizarPropietario } from "@/lib/services/propietario.service";
import { actualizarPropietarioSchema } from "@/lib/validators/propietario";
import { revalidatePath } from "next/cache";

export async function actualizarPropietarioAction(formData: {
  nombre?: string;
  apellido?: string;
  fecha_nacimiento?: string;
  dni?: string;
  direccion?: string;
  email?: string;
  telefono?: string;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("No autorizado");

  const metadata = sessionClaims?.publicMetadata as { role?: string; id_propietario?: string };
  if (!metadata?.id_propietario) throw new Error("No autorizado");

  const validation = actualizarPropietarioSchema.safeParse(formData);
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors };
  }

  const result = await actualizarPropietario(metadata.id_propietario, validation.data);
  if (result.error) return { error: result.error };

  if (validation.data.email) {
    await (await clerkClient()).users.updateUser(userId, {
      primaryEmailAddressID: undefined,
    });
  }

  revalidatePath("/dashboard/perfil");
  return { data: result.data };
}