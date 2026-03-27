"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { ROLES } from "@/config/roles";
import type { Role } from "@/types/role.types";

interface UserMenuProps {
  isAuthenticated: boolean;
  userName?: string;
  userRole?: Role;
}

export function UserMenu({ isAuthenticated, userName, userRole }: UserMenuProps) {
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        {/* Desktop: visible buttons */}
        <Button variant="ghost" asChild className="hidden md:inline-flex">
          <Link href="/sign-in">Se connecter</Link>
        </Button>
        <Button asChild className="hidden md:inline-flex">
          <Link href="/sign-up">Créer un compte</Link>
        </Button>

        {/* Mobile: icon dropdown */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu de connexion">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/sign-in">Se connecter</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/sign-up">Créer un compte</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  function handleLogout() {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Menu de ${userName}`}>
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {userRole === ROLES.ADMIN && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin/establishments">Gérer les établissements</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/managers">Gérer les gérants</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {userRole === ROLES.MANAGER && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/manager/suites">Gérer mes suites</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/manager/bookings">Réservations</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild>
          <Link href="/bookings">Mes réservations</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
