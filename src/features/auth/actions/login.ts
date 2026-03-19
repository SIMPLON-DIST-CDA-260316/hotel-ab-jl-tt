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
import { loginSchema } from "@/features/auth/lib/auth-schemas";
import type {
  AuthActionState,
  LoginFormValues,
} from "@/features/auth/types/auth.types";

export async function login(
  _previousState: AuthActionState<LoginFormValues>,
  formData: FormData,
): Promise<AuthActionState<LoginFormValues>> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof LoginFormValues, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof LoginFormValues;
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return { status: "error", fieldErrors };
  }

  const callbackUrl = formData.get("callbackUrl") as string | null;

  try {
    await auth.api.signInEmail({
      body: { email: parsed.data.email, password: parsed.data.password },
      headers: await headers(),
    });
  } catch (error) {
    if (isHttpError(error, 401) || isHttpError(error, 403)) {
      return { status: "error", formError: AUTH_ERROR_CODES.INVALID_CREDENTIALS };
    }
    console.error("[login] Unexpected error during sign-in:", error);
    return { status: "error", formError: AUTH_ERROR_CODES.UNKNOWN_ERROR };
  }

  redirect(callbackUrl ?? "/");
}
