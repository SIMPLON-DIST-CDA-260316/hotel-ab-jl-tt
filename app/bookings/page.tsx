import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CalendarDays, Luggage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getClientBookings } from "@/features/bookings/queries/get-client-bookings";
import { BookingCard } from "@/features/bookings/components/BookingCard";
import { BOOKING_STATUSES } from "@/config/booking-statuses";

const ACTIVE_STATUSES = new Set([
  BOOKING_STATUSES.PENDING,
  BOOKING_STATUSES.CONFIRMED,
]);

export default async function BookingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in?callbackUrl=/bookings");
  }

  const clientBookings = await getClientBookings(session.user.id);

  const now = new Date();
  const upcomingBookings = clientBookings.filter(
    (clientBooking) =>
      ACTIVE_STATUSES.has(clientBooking.status) &&
      new Date(clientBooking.checkIn) > now,
  );
  const pastBookings = clientBookings.filter(
    (clientBooking) => !upcomingBookings.includes(clientBooking),
  );

  return (
    <main id="main-content" className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Mes réservations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Retrouvez vos séjours à venir et passés.
        </p>
      </div>

      {clientBookings.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="rounded-full bg-muted p-4">
            <Luggage className="size-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Aucune réservation</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Explorez nos établissements et réservez votre prochain séjour.
            </p>
          </div>
          <Button asChild>
            <Link href="/establishments">Parcourir les établissements</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-10">
          {upcomingBookings.length > 0 && (
            <section>
              <h2 className="mb-4 inline-flex items-center gap-2 text-lg font-semibold">
                <CalendarDays className="size-5 text-primary" aria-hidden />
                À venir
                <span className="text-sm font-normal text-muted-foreground">
                  ({upcomingBookings.length})
                </span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {upcomingBookings.map((upcomingBooking) => (
                  <BookingCard
                    key={upcomingBooking.id}
                    booking={upcomingBooking}
                  />
                ))}
              </div>
            </section>
          )}

          {pastBookings.length > 0 && (
            <section>
              <h2 className="mb-4 inline-flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                Passées
                <span className="text-sm font-normal">
                  ({pastBookings.length})
                </span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {pastBookings.map((pastBooking) => (
                  <BookingCard key={pastBooking.id} booking={pastBooking} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
