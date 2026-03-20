import { ManagerForm } from "@/features/managers/components/ManagerForm";
import { createManager } from "@/features/managers/actions/create-manager";
import { getEstablishmentsForSelect } from "@/features/managers/queries/get-establishments-for-select";

export default async function NewManagerPage() {
  const establishments = await getEstablishmentsForSelect();

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <ManagerForm
        action={createManager}
        establishments={establishments}
        submitLabel="Créer le gérant"
      />
    </main>
  );
}
