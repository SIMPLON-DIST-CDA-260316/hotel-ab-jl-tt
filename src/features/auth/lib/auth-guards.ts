"use server";

import { headers } from "next/headers";
import { forbidden, unauthorized } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Role } from "@/features/auth/types/auth.types";

interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

/**
 * Returns the current session or throws a Next.js 401 (unauthorized).
 * Use at the top of any protected query or Server Action.
 */
export async function requireSession(): Promise<Session> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    unauthorized();
  }

  return session as Session;
}

/**
 * Returns the session if the user has the required role, or throws 403 (forbidden).
 */
export async function requireRole(role: Role): Promise<Session> {
  const session = await requireSession();

  if (session.user.role !== role) {
    forbidden();
  }

  return session;
}

export async function requireAdmin(): Promise<Session> {
  return requireRole("admin");
}

export async function requireManager(): Promise<Session> {
  return requireRole("manager");
}

export async function requireClient(): Promise<Session> {
  return requireRole("client");
}

/**
 * Throws 403 if the current user is not the owner of the resource.
 * Use in manager actions to ensure they only act on their own establishment.
 */
export async function requireOwnership(
  session: Session,
  ownerId: string,
): Promise<void> {
  if (session.user.id !== ownerId && session.user.role !== "admin") {
    forbidden();
  }
}
