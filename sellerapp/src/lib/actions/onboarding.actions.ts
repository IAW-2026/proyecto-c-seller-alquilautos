"use server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { onboardingSchema } from "@/lib/validators/propietario";
import { registrarPropietario } from "@/lib/services/propietario.service";

export async function onboardingAction(formData: {
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  dni: string;
  direccion: string;
  telefono: string;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("No autorizado");

  const metadata = sessionClaims?.publicMetadata as { role?: string; id_propietario?: string };

  if (metadata?.role && metadata.role !== "propietario") throw new Error("No autorizado");

  if (metadata?.id_propietario) {
    return { id_propietario: metadata.id_propietario, alreadyCompleted: true };
  }

  const validation = onboardingSchema.safeParse(formData);
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors };
  }

  const clerkUser = await (await clerkClient()).users.getUser(userId);
  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error("No se encontró el email del usuario");

  try {
    const result = await registrarPropietario(email, validation.data);
    const propietario = result.data;

    await (await clerkClient()).users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "propietario",
        id_propietario: propietario.id_propietario,
      },
    });

    return { id_propietario: propietario.id_propietario };
  } catch (error: any) {
    if (error?.code === "P2002") {
      const target = error.meta?.target;
      const campo = Array.isArray(target) ? target[0] : String(target ?? "campo");
      if (campo === "email") return { error: "Ya existe un propietario con ese email" };
      if (campo === "dni") return { error: "Ya existe un propietario con ese DNI" };
      return { error: `Ya existe un propietario con ese ${campo}` };
    }
    throw error;
  }
}
