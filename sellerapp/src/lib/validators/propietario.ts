import { z } from "zod";

export const onboardingSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  fecha_nacimiento: z.string().min(1, "La fecha de nacimiento es requerida"),
  dni: z.string().min(1, "El DNI es requerido"),
  direccion: z.string().min(1, "La dirección es requerida"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;