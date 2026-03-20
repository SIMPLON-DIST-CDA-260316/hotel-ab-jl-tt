"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

function isHttpError(error: unknown, statusCode: number): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    (error as Record<string, unknown>).statusCode === statusCode
  );
}
import { AUTH_ERROR_CODES } from "@/features/auth/lib/auth-error-codes";
import { registerSchema } from "@/features/auth/lib/auth-schemas";
import type {
  AuthActionState,
  RegisterFormValues,
} from "@/features/auth/types/auth.types";

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

  redirect("/");
}
