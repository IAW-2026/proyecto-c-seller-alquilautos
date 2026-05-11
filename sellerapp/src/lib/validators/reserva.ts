import { z } from "zod";

export const crearReservaSchema = z.object({
  id_alquilador: z.string().min(1, "id_alquilador es requerido"),
  id_vehiculo: z.string().min(1, "id_vehiculo es requerido"),
  id_propietario: z.string().min(1, "id_propietario es requerido"),
  fecha_inicio: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, "Formato requerido: DD-MM-YYYY"),
  fecha_final: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, "Formato requerido: DD-MM-YYYY"),
});

export type CrearReservaInput = z.infer<typeof crearReservaSchema>;