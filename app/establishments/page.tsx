import { Suspense } from "react";
import { getEstablishments } from "@/features/establishments/queries/get-establishments";
import { EstablishmentList } from "@/features/establishments/components/EstablishmentList";
import { EstablishmentListSkeleton } from "@/features/establishments/components/EstablishmentListSkeleton";

export const dynamic = "force-dynamic";

export default function EstablishmentsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Nos établissements</h1>
      <Suspense fallback={<EstablishmentListSkeleton />}>
        <EstablishmentListServer />
      </Suspense>
    </main>
  );
}

async function EstablishmentListServer() {
  const establishments = await getEstablishments();
  return <EstablishmentList establishments={establishments} />;
}
