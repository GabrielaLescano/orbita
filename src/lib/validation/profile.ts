import { z } from "zod";
import { MAX_CSS_CHARS } from "@/lib/sanitize";
import { MAX_HTML_CHARS } from "@/lib/sanitize";
import { HANDLE_PATTERN } from "@/data/get-profile";

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

const RESERVED_HANDLES = new Set(["ingresar", "perfil", "u", "p", "api", "admin"]);

export const profileFormSchema = z.object({
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .regex(HANDLE_PATTERN, "De 3 a 30 caracteres: letras, números, punto, guion o guion bajo.")
    .refine((h: string) => !RESERVED_HANDLES.has(h), "Ese handle está reservado."),
  tagline: z.string().trim().max(140, "Hasta 140 caracteres."),
  status: z.string().trim().max(60, "Hasta 60 caracteres.").default("En línea"),
  aboutHtml: z.string().max(MAX_HTML_CHARS, "El contenido es demasiado largo."),
  customCss: z.string().max(MAX_CSS_CHARS, "El CSS es demasiado largo."),
  themeAccent1: z.string().regex(HEX_COLOR, "Tiene que ser un color hexadecimal, como #ff3ddb."),
  themeAccent2: z.string().regex(HEX_COLOR, "Tiene que ser un color hexadecimal, como #27d9f5."),
});

export type ProfileFormInput = z.infer<typeof profileFormSchema>;
