import { z } from "zod";
import { handleSchema } from "./profile";

const email = z.string().trim().toLowerCase().email("Ingresá un email válido.");
const password = z.string().min(8, "Mínimo 8 caracteres.").max(72, "Máximo 72 caracteres.");

// El registro crea la cuenta Y el perfil en un solo paso: por eso también
// pide el handle acá (el resto del perfil —"Sobre mí", tema, etc.— se
// completa después en /perfil/editar, con valores por defecto mientras tanto).
export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Contanos cómo te llamás.").max(60),
    handle: handleSchema,
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Ingresá tu contraseña."),
});
