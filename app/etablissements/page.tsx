import { Suspense } from "react";
import { getEtablissements } from "@/features/etablissements/queries/get-etablissements";
import { EtablissementList } from "@/features/etablissements/components/EtablissementList";
import { EtablissementListSkeleton } from "@/features/etablissements/components/EtablissementListSkeleton";

export const dynamic = "force-dynamic";

export default function EtablissementsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Nos établissements</h1>
      <Suspense fallback={<EtablissementListSkeleton />}>
        <EtablissementListServer />
      </Suspense>
    </main>
  );
}

async function EtablissementListServer() {
  const etablissements = await getEtablissements();
  return <EtablissementList etablissements={etablissements} />;
}
