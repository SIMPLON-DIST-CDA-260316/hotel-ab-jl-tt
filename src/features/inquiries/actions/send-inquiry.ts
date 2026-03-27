"use server";

import { db } from "@/lib/db";
import { inquiry } from "@/lib/db/schema/domain";
import { auth } from "@/lib/auth";
import { type FormState, type InquiryFormData, inquirySchema } from "../lib/send-inquiry-shema";
import { headers } from "next/headers";
import { getEstablishmentById } from "@/features/establishments/queries/get-establishment-by-id";

export async function sendInquiry(
    previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = Object.fromEntries(formData);
  const parsed = inquirySchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      values: {
        name: String(raw.name ?? ""),
        email: String(raw.email ?? ""),
        subject: raw.subject as InquiryFormData["subject"] | undefined,
        establishment: String(raw.establishment ?? ""),
        message: String(raw.message ?? ""),
      },
    };
  }

  const formEstablishmentId = parsed.data.establishment;
  const establishment = await getEstablishmentById(formEstablishmentId);
  
  if (!establishment) {
    return {
      success: false,
    };
  }

  const data = await auth.api.getSession({ headers: await headers() });
  const userId = data?.user?.id ?? null;

  try {
    await db.insert(inquiry).values({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
      userId,
      establishmentId: establishment.id,
    });
  } catch (error) {
    console.error("Failed to send inquiry:", error);
    return {
      success: false,
      errors: { _form: ["Une erreur est survenue lors de l'envoi"] },
      values: {
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        establishment: parsed.data.establishment,
        message: parsed.data.message,
      },
    };
  }
  return {
    values: {
      name: "",
      establishment: establishment.id,
      email: "",
      subject: undefined,
      message: "",
    },
    errors: null,
    success: true,
  };
}
