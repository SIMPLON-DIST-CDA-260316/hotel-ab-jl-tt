/**
 * Better Auth server instance — server-side only.
 *
 * This is the single configuration point for authentication: providers,
 * database adapter, additional user fields (role), and trusted origins.
 * Exposes `auth.api.*` for use in Server Actions and route handlers.
 *
 * For client-side auth hooks (useSession, signIn, signOut), use auth-client.ts instead.
 */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import {
  user,
  session,
  account,
  verification,
} from "@/lib/db/schema/auth";
import { ROLES } from "@/config/roles";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: { enabled: true, autoSignIn: true },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: ROLES.CLIENT,
        input: false,
      },
    },
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
  plugins: [nextCookies()],
});
