import { notFound } from "next/navigation";
import { getEstablishmentById } from "@/features/establishments/queries/get-establishment-by-id";
import { EstablishmentForm } from "@/features/establishments/components/EstablishmentForm";
import { updateEstablishment } from "@/features/establishments/actions/update-establishment";

type EditEstablishmentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditEstablishmentPage({
  params,
}: EditEstablishmentPageProps) {
  // TODO: vérifier rôle admin
  const { id } = await params;
  const establishment = await getEstablishmentById(id);

  if (!establishment) {
    notFound();
  }

  const updateAction = updateEstablishment.bind(null, id);

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <EstablishmentForm
        action={updateAction}
        defaultValues={{
          name: establishment.name,
          city: establishment.city,
          address: establishment.address,
          postalCode: establishment.postalCode,
          description: establishment.description ?? "",
          phone: establishment.phone ?? "",
          email: establishment.email ?? "",
          checkInTime: establishment.checkInTime,
          checkOutTime: establishment.checkOutTime,
        }}
        submitLabel="Enregistrer les modifications"
      />
    </main>
  );
}
