import { z } from "zod";

export const onboardingSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  fecha_nacimiento: z.string().min(1, "La fecha de nacimiento es requerida"),
  dni: z.string().min(1, "El DNI es requerido"),
  direccion: z.string().min(1, "La dirección es requerida"),
  telefono: z.string().min(1, "El teléfono es requerido"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const actualizarPropietarioSchema = z.object({
  nombre: z.string().min(1).optional(),
  apellido: z.string().min(1).optional(),
  fecha_nacimiento: z.string().optional(),
  dni: z.string().min(1).optional(),
  direccion: z.string().min(1).optional(),
  email: z.string().email().optional(),
  telefono: z.string().min(1).optional(),
});

export type ActualizarPropietarioInput = z.infer<typeof actualizarPropietarioSchema>;