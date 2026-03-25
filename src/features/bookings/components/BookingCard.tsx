import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CancelBookingButton } from "./CancelBookingButton";
import { BOOKING_STATUSES } from "@/config/booking-statuses";
import { CANCELLATION_DELAY_DAYS } from "../lib/booking-constants";
import type { ClientBooking } from "../queries/get-client-bookings";

const STATUS_LABELS: Record<string, string> = {
  [BOOKING_STATUSES.PENDING]: "En attente",
  [BOOKING_STATUSES.CONFIRMED]: "Confirmée",
  [BOOKING_STATUSES.CANCELLED]: "Annulée",
  [BOOKING_STATUSES.COMPLETED]: "Terminée",
};

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  [BOOKING_STATUSES.PENDING]: "outline",
  [BOOKING_STATUSES.CONFIRMED]: "default",
  [BOOKING_STATUSES.CANCELLED]: "destructive",
  [BOOKING_STATUSES.COMPLETED]: "secondary",
};

type BookingCardProps = {
  booking: ClientBooking;
};

export function BookingCard({ booking: bookingData }: BookingCardProps) {
  const checkInDate = new Date(bookingData.checkIn);
  const now = new Date();
  const daysUntilCheckIn = Math.ceil(
    (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  const isCancellable =
    bookingData.status === BOOKING_STATUSES.CONFIRMED &&
    daysUntilCheckIn > CANCELLATION_DELAY_DAYS;

  // Pending expired = treat as expired visually
  const isPendingExpired =
    bookingData.status === BOOKING_STATUSES.PENDING &&
    bookingData.expiresAt &&
    new Date(bookingData.expiresAt) < now;

  const displayStatus = isPendingExpired
    ? "Expirée"
    : STATUS_LABELS[bookingData.status];
  const displayVariant = isPendingExpired
    ? ("destructive" as const)
    : STATUS_VARIANTS[bookingData.status];

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {bookingData.suite.title}
            </CardTitle>
            <CardDescription>
              {bookingData.establishment.name} —{" "}
              {bookingData.establishment.city}
            </CardDescription>
          </div>
          <Badge variant={displayVariant}>{displayStatus}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">
          Du {dateFormatter.format(checkInDate)} au{" "}
          {dateFormatter.format(new Date(bookingData.checkOut))}
        </p>
        <p className="text-sm">
          {currencyFormatter.format(Number(bookingData.totalPrice))} (
          {currencyFormatter.format(Number(bookingData.pricePerNight))}/nuit)
        </p>
        <p className="text-sm text-muted-foreground">
          Réf. {bookingData.reference}
        </p>
        {isCancellable && <CancelBookingButton bookingId={bookingData.id} />}
      </CardContent>
    </Card>
  );
}
