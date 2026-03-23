import type { Role } from "@/types/role.types";

/**
 * Authenticated session shape returned by auth guards.
 *
 * Subset of the Better Auth session — only the fields consumed by the
 * authorization layer. Includes the custom `role` field added via
 * Better Auth's `additionalFields` in src/lib/auth.ts.
 */
export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}
