import Link from "next/link";
import { notFound } from "next/navigation";
import { getManagerById } from "@/features/managers/queries/get-manager-by-id";
import { getEstablishmentsForSelect } from "@/features/managers/queries/get-establishments-for-select";
import { ManagerForm } from "@/features/managers/components/ManagerForm";
import { updateManager } from "@/features/managers/actions/update-manager";

type EditManagerPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditManagerPage({ params }: EditManagerPageProps) {
  const { id } = await params;
  const [manager, establishments] = await Promise.all([
    getManagerById(id),
    getEstablishmentsForSelect(),
  ]);

  if (!manager) {
    notFound();
  }

  const updateAction = updateManager.bind(null, id);

  // Split "Prénom Nom" back to firstName/lastName
  const nameParts = manager.name.split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/admin/managers"
        className="mb-4 inline-block text-sm text-muted-foreground hover:underline"
      >
        &larr; Retour à la liste
      </Link>
      <ManagerForm
        action={updateAction}
        establishments={establishments}
        defaultValues={{
          firstName,
          lastName,
          email: manager.email,
          establishmentId: manager.establishmentId ?? undefined,
        }}
        editingManagerId={id}
        showPassword={false}
        submitLabel="Enregistrer les modifications"
      />
    </main>
  );
}
