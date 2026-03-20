import { z } from "zod";

export const suiteSchema = z.object({
  title: z.string().min(1, "Le titre est obligatoire").max(255),
  description: z.string().max(2000).optional().or(z.literal("")),
  price: z
    .string()
    .min(1, "Le prix est obligatoire")
    .refine(
      (val) => /^\d+([.,]\d{1,2})?$/.test(val) && parseFloat(val.replace(",", ".")) > 0,
      "Le prix doit être un nombre positif",
    ),
  capacity: z
    .string()
    .min(1, "La capacité est obligatoire")
    .refine(
      (val) => /^\d+$/.test(val) && parseInt(val) > 0,
      "La capacité doit être un entier positif",
    ),
  area: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || (/^\d+([.,]\d{1,2})?$/.test(val) && parseFloat(val.replace(",", ".")) > 0),
      "La superficie doit être un nombre positif",
    ),
  establishmentId: z.string().min(1, "L'établissement est obligatoire"),
});