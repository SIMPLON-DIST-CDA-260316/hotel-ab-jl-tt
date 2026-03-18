import { EstablishmentForm } from "@/features/establishments/components/EstablishmentForm";
import { createEstablishment } from "@/features/establishments/actions/create-establishment";

export default function NewEstablishmentPage() {
  // TODO: vérifier rôle admin (redirect si non autorisé)

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <EstablishmentForm
        action={createEstablishment}
        submitLabel="Créer l'établissement"
      />
    </main>
  );
}
