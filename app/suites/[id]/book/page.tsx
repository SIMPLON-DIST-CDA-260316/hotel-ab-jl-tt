import { notFound, redirect } from "next/navigation";
import { getSuiteWithEstablishment } from "@/features/bookings/queries/get-suite-with-establishment";
import { getEstablishmentOptionsBySuiteId } from "@/features/bookings/queries/get-establishment-options";
import { CheckoutForm } from "@/features/bookings/components/CheckoutForm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type BookPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkIn?: string; checkOut?: string; guestCount?: string }>;
};

export default async function BookPage({ params, searchParams }: BookPageProps) {
  const { id } = await params;
  const queryParams = await searchParams;

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(`/sign-in?callbackUrl=/suites/${id}/book`);
  }

  const [suiteData, establishmentOptions] = await Promise.all([
    getSuiteWithEstablishment(id),
    getEstablishmentOptionsBySuiteId(id),
  ]);

  if (!suiteData) {
    notFound();
  }

  return (
    <main id="main-content" className="container mx-auto max-w-2xl px-4 py-8">
      <CheckoutForm
        suiteId={suiteData.id}
        suiteTitle={suiteData.title}
        suiteImage={suiteData.mainImage}
        establishmentName={suiteData.establishment.name}
        pricePerNight={Number(suiteData.price)}
        capacity={suiteData.capacity}
        options={establishmentOptions}
        initialCheckIn={queryParams.checkIn ?? ""}
        initialCheckOut={queryParams.checkOut ?? ""}
        initialGuestCount={Number(queryParams.guestCount) || 1}
      />
    </main>
  );
}
