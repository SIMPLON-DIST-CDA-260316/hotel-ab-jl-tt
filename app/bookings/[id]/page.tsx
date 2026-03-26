import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Hash,
  ArrowLeft,
  ExternalLink,
  BedDouble,
} from "lucide-react";
import { requireSession } from "@/lib/auth-guards";
import { MILLISECONDS_PER_DAY, fullDateFormatter } from "@/lib/formatters";
import { getBookingDetail } from "@/features/bookings/queries/get-booking-detail";
import { CancelBookingButton } from "@/features/bookings/components/CancelBookingButton";
import { DetailRow } from "@/features/bookings/components/DetailRow";
import { SectionHeader } from "@/features/bookings/components/SectionHeader";
import { BookingOptionsSection } from "@/features/bookings/components/BookingOptionsSection";
import { BookingPricingSection } from "@/features/bookings/components/BookingPricingSection";
import {
  STATUS_LABELS,
  STATUS_BADGE_CLASSES,
} from "@/features/bookings/lib/booking-status-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { BOOKING_STATUSES } from "@/config/booking-statuses";
import { CANCELLATION_DELAY_DAYS } from "@/features/bookings/lib/booking-constants";

const PLACEHOLDER_IMAGE_MARKER = "placeholder";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id: bookingId } = await params;
  const bookingData = await getBookingDetail(bookingId);

  if (!bookingData || bookingData.clientId !== session.user.id) {
    notFound();
  }

  const checkInDate = new Date(bookingData.checkIn);
  const checkOutDate = new Date(bookingData.checkOut);
  const now = new Date();
  const daysUntilCheckIn = Math.ceil(
    (checkInDate.getTime() - now.getTime()) / MILLISECONDS_PER_DAY,
  );
  const nightCount = Math.round(
    (checkOutDate.getTime() - checkInDate.getTime()) / MILLISECONDS_PER_DAY,
  );

  const isConfirmedFuture =
    bookingData.status === BOOKING_STATUSES.CONFIRMED && daysUntilCheckIn > 0;
  const isCancellable =
    isConfirmedFuture && daysUntilCheckIn > CANCELLATION_DELAY_DAYS;

  const hasImage =
    bookingData.suite.mainImage &&
    !bookingData.suite.mainImage.includes(PLACEHOLDER_IMAGE_MARKER);

  return (
    <main id="main-content" className="container mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" size="sm" className="mb-6 -ml-2" asChild>
        <Link href="/bookings">
          <ArrowLeft className="mr-1 size-4" />
          Mes réservations
        </Link>
      </Button>

      <Card className="gap-0 overflow-hidden py-0">
        <AspectRatio ratio={16 / 7}>
          {hasImage ? (
            <Image
              src={bookingData.suite.mainImage}
              alt={bookingData.suite.title}
              fill
              className="object-cover"
              sizes="(min-width: 672px) 672px, 100vw"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <span className="text-4xl font-bold text-primary/20">
                {bookingData.suite.title.charAt(0)}
              </span>
            </div>
          )}
        </AspectRatio>

        <CardContent className="space-y-6 p-6">
          {/* Header: title + badge + reference */}
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold sm:text-2xl">
                {bookingData.suite.title}
              </h1>
              <Badge
                variant="outline"
                className={STATUS_BADGE_CLASSES[bookingData.status]}
              >
                {STATUS_LABELS[bookingData.status]}
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>{bookingData.establishment.name}</span>
              <span className="inline-flex items-center gap-1">
                <Hash className="size-3" aria-hidden />
                <span className="font-mono text-xs">
                  {bookingData.reference}
                </span>
              </span>
            </div>
          </div>

          <Separator />

          {/* Séjour */}
          <section className="space-y-3">
            <SectionHeader
              icon={
                <CalendarDays
                  className="size-3.5 text-primary"
                  aria-hidden
                />
              }
            >
              Séjour
            </SectionHeader>
            <div className="space-y-2">
              <DetailRow label="Arrivée">
                <span className="capitalize">
                  {fullDateFormatter.format(checkInDate)}
                </span>
              </DetailRow>
              <DetailRow label="Départ">
                <span className="capitalize">
                  {fullDateFormatter.format(checkOutDate)}
                </span>
              </DetailRow>
              <DetailRow label="Durée">
                {nightCount} nuit{nightCount > 1 ? "s" : ""}
              </DetailRow>
              <DetailRow label="Voyageurs">
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5" aria-hidden />
                  {bookingData.guestCount}
                </span>
              </DetailRow>
            </div>
          </section>

          <Separator />

          {/* Établissement */}
          <section className="space-y-3">
            <SectionHeader
              icon={
                <MapPin className="size-3.5 text-primary" aria-hidden />
              }
            >
              Établissement
            </SectionHeader>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{bookingData.establishment.name}</p>
              <p className="text-muted-foreground">
                {bookingData.establishment.address}
                <br />
                {bookingData.establishment.postalCode}{" "}
                {bookingData.establishment.city}
              </p>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-3.5" aria-hidden />
                Check-in :{" "}
                {bookingData.establishment.checkInTime
                  ?.slice(0, 5)
                  .replace(":", "h")}{" "}
                — Check-out :{" "}
                {bookingData.establishment.checkOutTime
                  ?.slice(0, 5)
                  .replace(":", "h")}
              </div>
            </div>
          </section>

          <Separator />

          {/* Suite */}
          <section className="space-y-3">
            <SectionHeader
              icon={
                <BedDouble className="size-3.5 text-primary" aria-hidden />
              }
            >
              Suite
            </SectionHeader>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <p className="font-medium">{bookingData.suite.title}</p>
                <p className="text-muted-foreground">
                  {Number(bookingData.suite.area)} m² · Capacité{" "}
                  {bookingData.suite.capacity} pers.
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/suites/${bookingData.suiteId}`}>
                  <ExternalLink className="mr-1.5 size-3.5" />
                  Voir
                </Link>
              </Button>
            </div>
          </section>

          <BookingOptionsSection options={bookingData.options} />

          <Separator />

          <BookingPricingSection
            nightCount={nightCount}
            pricePerNight={bookingData.pricePerNight}
            options={bookingData.options}
            totalPrice={bookingData.totalPrice}
          />

          {isConfirmedFuture && (
            <>
              <Separator />
              <section>
                {isCancellable ? (
                  <div className="flex items-center gap-3">
                    <CancelBookingButton bookingId={bookingData.id} />
                    <span className="text-xs text-muted-foreground">
                      Annulation gratuite jusqu&apos;à{" "}
                      {CANCELLATION_DELAY_DAYS} jours avant l&apos;arrivée
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Annulation impossible (moins de{" "}
                    {CANCELLATION_DELAY_DAYS} jours avant l&apos;arrivée)
                  </p>
                )}
              </section>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
