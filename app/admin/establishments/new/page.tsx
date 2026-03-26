import { EstablishmentForm } from "@/features/establishments/components/EstablishmentForm";
import { createEstablishment } from "@/features/establishments/actions/create-establishment";
import { getAmenitiesForEstablishments } from "@/features/establishments/queries/get-amenities-for-establishments";

export default async function NewEstablishmentPage() {
  const availableAmenities = await getAmenitiesForEstablishments();

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <EstablishmentForm
        action={createEstablishment}
        availableAmenities={availableAmenities}
        submitLabel="Créer l'établissement"
      />
    </main>
  );
}
