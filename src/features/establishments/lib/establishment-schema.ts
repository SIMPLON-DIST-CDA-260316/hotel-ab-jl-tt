import { z } from "zod";

export const establishmentSchema = z.object({
  name: z.string().min(1, "Le nom est obligatoire").max(255),
  city: z.string().min(1, "La ville est obligatoire").max(255),
  address: z.string().min(1, "L'adresse est obligatoire").max(500),
  postalCode: z.string().min(1, "Le code postal est obligatoire").max(10),
  description: z.string().max(2000).optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  email: z.union([z.literal(""), z.string().email("Email invalide")]).optional(),
  checkInTime: z.string().min(1, "L'heure de check-in est obligatoire"),
  checkOutTime: z.string().min(1, "L'heure de check-out est obligatoire"),
  amenityIds: z.array(z.string()).default([]),
});

export type EstablishmentFormData = z.infer<typeof establishmentSchema>;
