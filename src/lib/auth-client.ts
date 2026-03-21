/**
 * Better Auth client instance — client-side only.
 *
 * Exposes React hooks (useSession, signIn, signOut) for use in Client Components.
 * Must never be imported in Server Components or Server Actions — use auth.ts instead.
 */
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
});
