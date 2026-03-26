import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { Button } from "@/components/ui/button";

export async function Header() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <header className="border-b px-6 py-3 flex items-center justify-between">
      <Link href="/" className="font-semibold">
        Clair de Lune
      </Link>
      <nav className="flex items-center gap-2">
        {session ? (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/bookings">Mes réservations</Link>
            </Button>
            <span className="text-sm text-muted-foreground">{session.user.name}</span>
            <LogoutButton />
          </>
        ) : (
          <>
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Se connecter</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Créer un compte</Link>
            </Button>
          </>
        )}
      </nav>
    </header>
  );
}
