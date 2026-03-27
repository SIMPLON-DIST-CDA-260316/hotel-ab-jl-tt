import { requireManager } from "@/lib/auth-guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getManagerBookings } from "@/features/bookings/queries/get-manager-bookings";
import { ManagerBookingsTable } from "@/features/bookings/components/ManagerBookingsTable";

export default async function ManagerBookingsPage() {
  const session = await requireManager();
  const bookings = await getManagerBookings(session.user.id);

  return (
    <main id="main-content" className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Réservations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Réservations sur l&#39;ensemble de vos établissements.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {bookings.length} réservation{bookings.length > 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ManagerBookingsTable bookings={bookings} />
        </CardContent>
      </Card>
    </main>
  );
}
