import Link from "next/link";
import { requireManager } from "@/features/auth/lib/auth-guards";
import { getEstablishmentsByManager } from "@/features/suites/queries/get-establishments-by-manager";
import { getSuitesByEstablishment } from "@/features/suites/queries/get-suites-by-establishment";
import { Button } from "@/components/ui/button";
import { DeleteSuiteButton } from "@/features/suites/components/DeleteSuiteButton";

export default async function ManagerSuitesPage() {
  const session = await requireManager();
  const establishments = await getEstablishmentsByManager(session.user.id);

  const suites = establishments.length
    ? await getSuitesByEstablishment(establishments[0].id)
    : [];

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes suites</h1>
        <Button asChild>
          <Link href="/manager/suites/new">Ajouter une suite</Link>
        </Button>
      </div>

      {suites.length === 0 ? (
        <p className="text-muted-foreground">Aucune suite enregistrée.</p>
      ) : (
        <ul className="space-y-3">
          {suites.map((suite) => (
            <li
              key={suite.id}
              className="flex items-center justify-between rounded-md border px-4 py-3"
            >
              <span className="font-medium">{suite.title}</span>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/manager/suites/${suite.id}/edit`}>Modifier</Link>
                </Button>
                <DeleteSuiteButton id={suite.id} title={suite.title} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
