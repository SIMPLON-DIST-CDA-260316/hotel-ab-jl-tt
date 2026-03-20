import { z } from "zod";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

export const createManagerSchema = z.object({
  firstName: z.string().min(1, "Le prénom est obligatoire").max(100),
  lastName: z.string().min(1, "Le nom est obligatoire").max(100),
  email: z.email("Email invalide"),
  password: z
    .string()
    .regex(
      PASSWORD_REGEX,
      "Min. 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial",
    ),
  establishmentId: z.string().min(1, "L'établissement est obligatoire"),
});

export type CreateManagerFormData = z.infer<typeof createManagerSchema>;

export const updateManagerSchema = z.object({
  firstName: z.string().min(1, "Le prénom est obligatoire").max(100),
  lastName: z.string().min(1, "Le nom est obligatoire").max(100),
  email: z.email("Email invalide"),
  establishmentId: z.string().optional().or(z.literal("")).or(z.literal("none")),
});

export type UpdateManagerFormData = z.infer<typeof updateManagerSchema>;
