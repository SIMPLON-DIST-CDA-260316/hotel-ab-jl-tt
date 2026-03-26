import { z } from "zod";

export const inquirySchema = z.object({
  establishment: z.string(),
  name: z.string().min(1, "Le nom est obligatoire").max(100),
  email: z
    .email("L'email n'est pas valide")
    .min(1, "L'email est obligatoire")
    .max(255),
  subject: z.enum(["complaint", "extra_service", "suite_info", "app_issue"], {
    error: "Veuillez choisir un sujet",
  }),
  message: z
    .string()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(2000, "Le message ne peut pas dépasser 2000 caractères"),
});

export type InquiryFormData = z.infer<typeof inquirySchema>;

export type FormState = {
  values?: z.infer<typeof inquirySchema>
  errors?: null | Partial<Record<keyof z.infer<typeof inquirySchema>, string[]> & {_form: string[]}>
  success: boolean
}
