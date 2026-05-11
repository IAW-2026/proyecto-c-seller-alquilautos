import { findPropietarioById } from "@/lib/repositories/propietario.repository";

export async function getPropietario(id: string) {
  const propietario = await findPropietarioById(id);

  if (!propietario) {
    return { data: null, error: "Propietario no encontrado" };
  }

  return { data: propietario, error: null };
}