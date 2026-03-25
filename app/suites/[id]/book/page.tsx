import { notFound, redirect } from "next/navigation";
import { getSuiteWithEstablishment } from "@/features/bookings/queries/get-suite-with-establishment";
import { BookingForm } from "@/features/bookings/components/BookingForm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type BookPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(`/sign-in?callbackUrl=/suites/${id}/book`);
  }

  const suiteData = await getSuiteWithEstablishment(id);

  if (!suiteData) {
    notFound();
  }

  return (
    <main id="main-content" className="container mx-auto max-w-2xl px-4 py-8">
      <BookingForm
        suiteId={suiteData.id}
        suiteTitle={suiteData.title}
        establishmentName={suiteData.establishment.name}
        pricePerNight={Number(suiteData.price)}
        capacity={suiteData.capacity}
      />
    </main>
  );
}
