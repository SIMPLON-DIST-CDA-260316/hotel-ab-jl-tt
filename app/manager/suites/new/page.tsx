import { requireManager } from "@/features/auth/lib/auth-guards";
import { getEstablishmentsByManager } from "@/features/suites/queries/get-establishments-by-manager";
import { SuiteForm } from "@/features/suites/components/SuiteForm";
import { createSuite } from "@/features/suites/actions/create-suite";

export default async function NewSuitePage() {
  const session = await requireManager();
  const establishments = await getEstablishmentsByManager(session.user.id);

  if (!establishments.length) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <p className="text-muted-foreground">
          Vous n&apos;avez aucun établissement actif. Contactez un administrateur
          pour en créer un.
        </p>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <SuiteForm action={createSuite} establishments={establishments} />
    </main>
  );
}
