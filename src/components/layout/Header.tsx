import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { HeaderAuthMenu } from "@/components/layout/HeaderAuthMenu";
import { Button } from "@/components/ui/button";

export async function Header() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <header className="flex items-center justify-between border-b px-4 py-3 md:px-6">
      <Link href="/" className="flex items-center gap-3 text-2xl font-bold">
        <Image
          src="/images/logo.svg"
          alt="Clair de Lune"
          width={36}
          height={36}
        />
        Clair de Lune
      </Link>
      <nav className="flex items-center gap-2">
        {session ? (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/bookings">Mes réservations</Link>
            </Button>
            <span className="hidden text-sm text-muted-foreground md:inline">
              {session.user.name}
            </span>
            <LogoutButton />
          </>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/sign-in">Se connecter</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/sign-up">Créer un compte</Link>
              </Button>
            </div>
            {/* Mobile */}
            <div className="sm:hidden">
              <HeaderAuthMenu />
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
