import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getClientBookings } from "@/features/bookings/queries/get-client-bookings";
import { BookingCard } from "@/features/bookings/components/BookingCard";

export default async function BookingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in?callbackUrl=/bookings");
  }

  const clientBookings = await getClientBookings(session.user.id);

  return (
    <main id="main-content" className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Mes réservations</h1>

      {clientBookings.length === 0 ? (
        <p className="text-muted-foreground">
          Vous n&apos;avez aucune réservation.
        </p>
      ) : (
        <div className="space-y-4">
          {clientBookings.map((clientBooking) => (
            <BookingCard key={clientBooking.id} booking={clientBooking} />
          ))}
        </div>
      )}
    </main>
  );
}
