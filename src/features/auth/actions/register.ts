"use server";

import { auth } from "@/lib/auth";

export async function register(name: string, email: string, password: string) {
  return auth.api.signUpEmail({ body: { name, email, password } });
}
