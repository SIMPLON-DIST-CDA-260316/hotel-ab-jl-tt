import Link from "next/link";
import { ManagerForm } from "@/features/managers/components/ManagerForm";
import { createManager } from "@/features/managers/actions/create-manager";
import { getEstablishmentsForSelect } from "@/features/managers/queries/get-establishments-for-select";

export default async function NewManagerPage() {
  const establishments = await getEstablishmentsForSelect();

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/admin/managers"
        className="mb-4 inline-block text-sm text-muted-foreground hover:underline"
      >
        &larr; Retour à la liste
      </Link>
      <ManagerForm
        action={createManager}
        establishments={establishments}
        submitLabel="Créer le gérant"
      />
    </main>
  );
}
