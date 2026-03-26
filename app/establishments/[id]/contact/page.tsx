"use server";

import { notFound } from "next/navigation";
import { getEstablishmentById } from "@/features/establishments/queries/get-establishment-by-id";
import ContactForm from "@/features/inquiries/components/InquiryForm";

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
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">{establishment.name}</h1>
      </header>
      <ContactForm establishment={establishment} />
    </main>
  );
}
