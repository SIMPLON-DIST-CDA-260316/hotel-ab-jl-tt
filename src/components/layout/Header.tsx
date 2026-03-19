import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
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
