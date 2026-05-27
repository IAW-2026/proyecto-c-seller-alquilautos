import { z } from "zod";

export const crearVehiculoSchema = z.object({
  marca: z.string().min(1, "La marca es requerida"),
  modelo: z.string().min(1, "El modelo es requerido"),
   anio: z.coerce.number().int().min(1990).max(new Date().getFullYear() + 1),
  precio: z.coerce.number().positive("El precio debe ser mayor a 0"),
  fotos: z.array(z.string().url("Debe ser una URL válida")).min(1, "Al menos una foto es requerida"),
  estado: z.enum(["Disponible", "Alquilado"]).default("Disponible"),
});

export const actualizarVehiculoSchema = crearVehiculoSchema.partial();

export type CrearVehiculoInput = z.infer<typeof crearVehiculoSchema>;
export type ActualizarVehiculoInput = z.infer<typeof actualizarVehiculoSchema>;