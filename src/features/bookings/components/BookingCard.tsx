import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BOOKING_STATUSES } from "@/config/booking-statuses";
import type { ClientBooking } from "../queries/get-client-bookings";

const STATUS_LABELS: Record<string, string> = {
  [BOOKING_STATUSES.PENDING]: "En attente",
  [BOOKING_STATUSES.CONFIRMED]: "Confirmée",
  [BOOKING_STATUSES.CANCELLED]: "Annulée",
  [BOOKING_STATUSES.COMPLETED]: "Terminée",
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  [BOOKING_STATUSES.PENDING]:
    "border-amber-200/60 bg-amber-50/90 text-amber-700 dark:border-amber-800 dark:bg-amber-950/90 dark:text-amber-300",
  [BOOKING_STATUSES.CONFIRMED]:
    "border-green-200/60 bg-green-50/90 text-green-700 dark:border-green-800 dark:bg-green-950/90 dark:text-green-300",
  [BOOKING_STATUSES.CANCELLED]:
    "border-red-200/60 bg-red-50/90 text-red-700 dark:border-red-800 dark:bg-red-950/90 dark:text-red-300",
  [BOOKING_STATUSES.COMPLETED]:
    "border-zinc-200/60 bg-zinc-50/90 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-400",
};

const EXPIRED_BADGE_CLASS =
  "border-red-200/60 bg-red-50/90 text-red-700 dark:border-red-800 dark:bg-red-950/90 dark:text-red-300";

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

type BookingCardProps = {
  booking: ClientBooking;
};

function formatCountdown(daysUntilCheckIn: number): string | null {
  if (daysUntilCheckIn <= 0) return null;
  if (daysUntilCheckIn === 1) return "Demain";
  return `Dans ${daysUntilCheckIn} j.`;
}

function computeNightCount(checkIn: Date, checkOut: Date): number {
  return Math.round(
    (checkOut.getTime() - checkIn.getTime()) / MILLISECONDS_PER_DAY,
  );
}

export function BookingCard({ booking: bookingData }: BookingCardProps) {
  const checkInDate = new Date(bookingData.checkIn);
  const checkOutDate = new Date(bookingData.checkOut);
  const now = new Date();
  const daysUntilCheckIn = Math.ceil(
    (checkInDate.getTime() - now.getTime()) / MILLISECONDS_PER_DAY,
  );
  const nightCount = computeNightCount(checkInDate, checkOutDate);

  const isPendingExpired =
    bookingData.status === BOOKING_STATUSES.PENDING &&
    bookingData.expiresAt &&
    new Date(bookingData.expiresAt) < now;

  const displayStatus = isPendingExpired
    ? "Expirée"
    : STATUS_LABELS[bookingData.status];
  const badgeClass = isPendingExpired
    ? EXPIRED_BADGE_CLASS
    : STATUS_BADGE_CLASSES[bookingData.status];

  const countdown =
    bookingData.status === BOOKING_STATUSES.CONFIRMED
      ? formatCountdown(daysUntilCheckIn)
      : null;

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  });

  const hasImage =
    bookingData.suite.mainImage &&
    !bookingData.suite.mainImage.includes("placeholder");

  return (
    <Link
      href={`/bookings/${bookingData.id}`}
      className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <Card className="gap-0 overflow-hidden py-0 transition-shadow duration-200 group-hover:shadow-md">
        {/* Image + badge overlay */}
        <div className="relative">
          <AspectRatio ratio={5 / 2}>
            {hasImage ? (
              <Image
                src={bookingData.suite.mainImage}
                alt={bookingData.suite.title}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                <span className="text-2xl font-bold text-primary/20">
                  {bookingData.suite.title.charAt(0)}
                </span>
              </div>
            )}
          </AspectRatio>
          <Badge
            variant="outline"
            className={`absolute top-2 right-2 backdrop-blur-sm ${badgeClass}`}
          >
            {displayStatus}
          </Badge>
        </div>

        {/* Title + location */}
        <CardHeader className="pt-4 pb-2">
          <CardTitle className="group-hover:underline">
            {bookingData.suite.title}
          </CardTitle>
          <CardDescription>{bookingData.establishment.name}</CardDescription>
        </CardHeader>

        {/* Dates + countdown + arrow */}
        <CardContent className="pb-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-sm">
              <CalendarDays className="size-3.5 text-muted-foreground" aria-hidden />
              {dateFormatter.format(checkInDate)} →{" "}
              {dateFormatter.format(checkOutDate)}
              <span className="text-muted-foreground">
                · {nightCount} nuit{nightCount > 1 ? "s" : ""}
              </span>
            </span>
            {countdown && (
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                {countdown}
              </span>
            )}
          </div>

          {/* Expand arrow — bottom right */}
          <div className="mt-3 flex justify-end">
            <span className="inline-flex items-center gap-0 overflow-hidden rounded-full bg-primary p-2 transition-all duration-250 ease-out group-hover:gap-1.5 group-hover:pl-4 group-hover:pr-3">
              <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium text-primary-foreground opacity-0 transition-all duration-250 ease-out group-hover:max-w-24 group-hover:opacity-100">
                Voir plus
              </span>
              <ArrowRight className="size-4 text-primary-foreground" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
