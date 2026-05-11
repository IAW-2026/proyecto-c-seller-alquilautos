import { db } from "@/lib/db";

export async function findPropietarioById(id: string) {
  return db.propietario.findUnique({
    where: { id_propietario: id },
  });
}