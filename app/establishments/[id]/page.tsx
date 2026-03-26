import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getEstablishmentById } from "@/features/establishments/queries/get-establishment-by-id";
import { getEstablishmentPublicAmenities } from "@/features/establishments/queries/get-establishment-public-amenities";
import { getEstablishmentPublicOptions } from "@/features/establishments/queries/get-establishment-public-options";
import { EstablishmentAmenitiesSection } from "@/features/establishments/components/EstablishmentAmenitiesSection";
import { EstablishmentOptionsSection } from "@/features/establishments/components/EstablishmentOptionsSection";
import { getSuitesByEstablishment } from "@/features/suites/queries/get-suites-by-establishment";
import { SuiteList } from "@/features/suites/components/SuiteList";
import { SuiteListSkeleton } from "@/features/suites/components/SuiteListSkeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EstablishmentDetailPage({ params }: Props) {
  const { id } = await params;

  const [establishment, amenities, options] = await Promise.all([
    getEstablishmentById(id),
    getEstablishmentPublicAmenities(id),
    getEstablishmentPublicOptions(id),
  ]);

  if (!establishment) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">{establishment.name}</h1>
        <p className="text-muted-foreground">
          {establishment.city} — {establishment.address}
        </p>
        {establishment.description && (
          <p className="mt-2">{establishment.description}</p>
        )}
        <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
          {/* PostgreSQL TIME returns "HH:MM:SS" — slice to "HH:MM" */}
          <span>Check-in : {establishment.checkInTime.slice(0, 5)}</span>
          <span>Check-out : {establishment.checkOutTime.slice(0, 5)}</span>
        </div>
        {establishment.phone && (
          <p className="mt-1 text-sm">Tél : {establishment.phone}</p>
        )}
        {establishment.email && (
          <p className="mt-1 text-sm">Email : {establishment.email}</p>
        )}
        <Button className="mt-2">
          <Link href={`/establishments/${id}/contact`}>
            Contacter l'établissement
          </Link>
        </Button>
      </header>

      <EstablishmentAmenitiesSection amenities={amenities} />
      <EstablishmentOptionsSection options={options} />

      <section>
        <h2 className="mb-4 text-xl font-semibold">Nos suites</h2>
        <Suspense fallback={<SuiteListSkeleton />}>
          <SuiteListServer establishmentId={id} />
        </Suspense>
      </section>
    </main>
  );
}

async function SuiteListServer({
  establishmentId,
}: {
  establishmentId: string;
}) {
  const suites = await getSuitesByEstablishment(establishmentId);
  return <SuiteList suites={suites} />;
}
