import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { BOOKING_STATUSES } from "@/config/booking-statuses";
import { MILLISECONDS_PER_DAY } from "@/lib/formatters";
import { getBookingForCheckout } from "@/features/bookings/queries/get-booking-for-checkout";
import { CheckoutCard } from "@/features/bookings/components/CheckoutCard";

type CheckoutPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(`/sign-in?callbackUrl=/bookings/${id}/checkout`);
  }

  const bookingData = await getBookingForCheckout(id);

  if (!bookingData || bookingData.clientId !== session.user.id) {
    notFound();
  }

  // Only pending bookings can be checked out
  if (bookingData.status !== BOOKING_STATUSES.PENDING) {
    redirect("/bookings");
  }

  const nightCount = Math.ceil(
    (new Date(bookingData.checkOut).getTime() -
      new Date(bookingData.checkIn).getTime()) /
      MILLISECONDS_PER_DAY,
  );

  return (
    <main id="main-content" className="container mx-auto max-w-2xl px-4 py-8">
      <CheckoutCard
        bookingId={bookingData.id}
        reference={bookingData.reference}
        suiteTitle={bookingData.suite.title}
        establishmentName={bookingData.establishment.name}
        checkIn={bookingData.checkIn.toISOString()}
        checkOut={bookingData.checkOut.toISOString()}
        nightCount={nightCount}
        pricePerNight={Number(bookingData.pricePerNight)}
        totalPrice={Number(bookingData.totalPrice)}
        guestCount={bookingData.guestCount}
        expiresAt={bookingData.expiresAt?.toISOString() ?? ""}
      />
    </main>
  );
}
