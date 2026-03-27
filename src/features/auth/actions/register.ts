"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { AUTH_ERROR_CODES } from "../lib/auth-error-codes";
import { registerSchema } from "../lib/auth-schemas";

import type {
  AuthActionState,
  RegisterFormValues,
} from "../types/auth.types";

function isHttpError(error: unknown, statusCode: number): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    (error as Record<string, unknown>).statusCode === statusCode
  );
}

export async function register(
  _previousState: AuthActionState<RegisterFormValues>,
  formData: FormData,
): Promise<AuthActionState<RegisterFormValues>> {
  const raw = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof RegisterFormValues, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof RegisterFormValues;
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return { status: "error", fieldErrors };
  }

  const callbackUrl = formData.get("callbackUrl") as string | null;

  const { firstName, lastName, email, password } = parsed.data;
  const name = `${firstName} ${lastName}`;

  try {
    await auth.api.signUpEmail({
      body: { name, email, password },
      headers: await headers(),
    });
  } catch (error) {
    if (isHttpError(error, 422)) {
      return { status: "error", formError: AUTH_ERROR_CODES.EMAIL_ALREADY_USED };
    }
    console.error("[register] Unexpected error during sign-up:", error);
    return { status: "error", formError: AUTH_ERROR_CODES.UNKNOWN_ERROR };
  }

  redirect((callbackUrl ?? "/") as Parameters<typeof redirect>[0]);
}
