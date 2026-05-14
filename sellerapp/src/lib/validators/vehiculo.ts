import { z } from "zod";

export const crearVehiculoSchema = z.object({
  marca: z.string().min(1, "La marca es requerida"),
  modelo: z.string().min(1, "El modelo es requerido"),
  precio: z.coerce.number().positive("El precio debe ser mayor a 0"),
  ubicacion: z.string().min(1, "La ubicación es requerida"),
  fotos: z.array(z.string().url("Debe ser una URL válida")).min(1, "Al menos una foto es requerida"),
});

export const actualizarVehiculoSchema = crearVehiculoSchema.partial();

export type CrearVehiculoInput = z.infer<typeof crearVehiculoSchema>;
export type ActualizarVehiculoInput = z.infer<typeof actualizarVehiculoSchema>;