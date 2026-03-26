import { z } from "zod";

export const bookingSchema = z
  .object({
    suiteId: z.string().min(1, "La suite est obligatoire"),
    checkIn: z.coerce.date({
      error: "La date d'arrivée est obligatoire",
    }),
    checkOut: z.coerce.date({
      error: "La date de départ est obligatoire",
    }),
    guestCount: z.coerce
      .number({ error: "Le nombre de voyageurs est obligatoire" })
      .int()
      .min(1, "Au moins 1 voyageur"),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "La date de départ doit être postérieure à la date d'arrivée",
    path: ["checkOut"],
  })
  .refine((data) => data.checkIn >= new Date(new Date().toDateString()), {
    message: "La date d'arrivée ne peut pas être dans le passé",
    path: ["checkIn"],
  });

export type BookingFormData = z.infer<typeof bookingSchema>;
