import { findPropietarioById, createPropietario, updatePropietario } from "@/lib/repositories/propietario.repository";
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

export async function actualizarPropietario(id: string, data: {
  nombre?: string;
  apellido?: string;
  fecha_nacimiento?: string;
  dni?: string;
  direccion?: string;
  email?: string;
}) {
  const existente = await findPropietarioById(id);
  if (!existente) return { data: null, error: "Propietario no encontrado" };

  const updated = await updatePropietario(id, {
    ...data,
    fecha_nacimiento: data.fecha_nacimiento ? new Date(data.fecha_nacimiento) : undefined,
  });

  return { data: updated, error: null };
}