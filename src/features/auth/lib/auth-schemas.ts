import { z } from "zod";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

export const registerSchema = z.object({
  firstName: z.string().min(1, "Requis"),
  lastName: z.string().min(1, "Requis"),
  email: z.email("Email invalide"),
  password: z
    .string()
    .regex(
      PASSWORD_REGEX,
      "Min. 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial",
    ),
});

export const loginSchema = z.object({
  email: z.email("Email invalide"),
  password: z.string().min(1, "Requis"),
});
