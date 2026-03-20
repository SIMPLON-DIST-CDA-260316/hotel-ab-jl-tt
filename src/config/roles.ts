import type { Role } from "@/types/role.types";

export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  CLIENT: "client",
} as const satisfies Record<string, Role>;
