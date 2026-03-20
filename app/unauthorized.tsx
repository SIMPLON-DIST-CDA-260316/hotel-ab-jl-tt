import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Connexion requise</h1>
      <p className="text-muted-foreground">
        Vous devez être connecté pour accéder à cette page.
      </p>
      <Button asChild>
        <Link href="/sign-in">Se connecter</Link>
      </Button>
    </main>
  );
}
