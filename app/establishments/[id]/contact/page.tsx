import { notFound } from "next/navigation";
import { getEstablishmentById } from "@/features/establishments/queries/get-establishment-by-id";
import {ContactForm} from "@/features/inquiries/components/InquiryForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EstablishmentContactPage({ params }: Props) {
  const { id } = await params;
  const establishment = await getEstablishmentById(id);

  if (!establishment) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold">{establishment.name}</h1>
        <p className="mt-1 text-muted-foreground">Nous contacter</p>
      </header>
      <ContactForm establishment={establishment} />
    </main>
  );
}
