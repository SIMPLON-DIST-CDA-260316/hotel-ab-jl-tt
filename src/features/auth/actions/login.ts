"use server";

import { auth } from "@/lib/auth";

export async function login(email: string, password: string) {
  return auth.api.signInEmail({ body: { email, password } });
}
