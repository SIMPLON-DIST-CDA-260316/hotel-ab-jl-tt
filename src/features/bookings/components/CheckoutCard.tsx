"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { confirmBooking } from "../actions/confirm-booking";

type CheckoutCardProps = {
  bookingId: string;
  reference: string;
  suiteTitle: string;
  establishmentName: string;
  checkIn: string;
  checkOut: string;
  nightCount: number;
  pricePerNight: number;
  totalPrice: number;
  guestCount: number;
  expiresAt: string;
};

export function CheckoutCard({
  bookingId,
  reference,
  suiteTitle,
  establishmentName,
  checkIn,
  checkOut,
  nightCount,
  pricePerNight,
  totalPrice,
  guestCount,
  expiresAt,
}: CheckoutCardProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    const expiryDate = new Date(expiresAt);

    function updateCountdown() {
      const remaining = Math.max(
        0,
        Math.floor((expiryDate.getTime() - Date.now()) / 1000),
      );
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        setIsExpired(true);
      }
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  });

  async function handleConfirm() {
    setIsPending(true);
    setError(null);
    const confirmResult = await confirmBooking(bookingId);
    if (confirmResult.success === true) {
      router.push("/bookings");
    } else {
      setError(confirmResult.errors._form?.[0] ?? "Erreur lors du paiement");
      setIsPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finaliser votre réservation</CardTitle>
        <CardDescription>Réf. {reference}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p>
            <strong>Établissement :</strong> {establishmentName}
          </p>
          <p>
            <strong>Suite :</strong> {suiteTitle}
          </p>
          <p>
            <strong>Du</strong> {dateFormatter.format(new Date(checkIn))}{" "}
            <strong>au</strong> {dateFormatter.format(new Date(checkOut))}
          </p>
          <p>
            <strong>Voyageurs :</strong> {guestCount}
          </p>
          <p>
            {nightCount} nuit(s) × {currencyFormatter.format(pricePerNight)}
          </p>
          <p className="text-lg font-semibold">
            Total : {currencyFormatter.format(totalPrice)}
          </p>
        </div>

        {!isExpired && (
          <p className="text-sm text-muted-foreground">
            Temps restant : {minutes}:{String(seconds).padStart(2, "0")}
          </p>
        )}

        {isExpired && (
          <p className="text-sm text-destructive">
            Le délai de réservation a expiré. Veuillez recommencer.
          </p>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleConfirm}
          disabled={isPending || isExpired}
          className="w-full"
        >
          {isPending
            ? "Traitement en cours..."
            : "Payer avec vos informations bancaires"}
        </Button>
      </CardFooter>
    </Card>
  );
}
