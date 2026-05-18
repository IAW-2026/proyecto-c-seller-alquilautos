import { findPropietarioById, createPropietario } from "@/lib/repositories/propietario.repository";
import type { OnboardingInput } from "@/lib/validators/propietario";

export async function getPropietario(id: string) {
  const propietario = await findPropietarioById(id);

  if (!propietario) {
    return { data: null, error: "Propietario no encontrado" };
  }

  return { data: propietario, error: null };
}

export async function registrarPropietario(email: string, input: OnboardingInput) {
  const propietario = await createPropietario({
    email,
    nombre: input.nombre,
    apellido: input.apellido,
    fecha_nacimiento: new Date(input.fecha_nacimiento),
    dni: input.dni,
    direccion: input.direccion,
  });
  return { data: propietario, error: null };
}