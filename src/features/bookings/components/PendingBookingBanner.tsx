"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";

type PendingBookingBannerProps = {
  bookingId: string;
  suiteTitle: string;
  expiresAt: string;
};

function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) return "expiré";

  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function PendingBookingBanner({
  bookingId,
  suiteTitle,
  expiresAt,
}: PendingBookingBannerProps) {
  const [timeRemaining, setTimeRemaining] = useState(() =>
    new Date(expiresAt).getTime() - Date.now(),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = new Date(expiresAt).getTime() - Date.now();
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (timeRemaining <= 0) return null;

  const isUrgent = timeRemaining < 2 * 60 * 1000;

  return (
    <Link
      href={`/bookings/${bookingId}/checkout`}
      className={`flex items-center justify-center gap-3 px-4 py-2 text-sm transition-colors ${
        isUrgent
          ? "bg-destructive/10 text-destructive hover:bg-destructive/15"
          : "bg-primary/10 text-primary hover:bg-primary/15"
      }`}
    >
      <Clock className="size-3.5" aria-hidden />
      <span>
        Réservation en attente pour <strong>{suiteTitle}</strong> — expire dans{" "}
        <strong>{formatTimeRemaining(timeRemaining)}</strong>
      </span>
      <ArrowRight className="size-3.5" aria-hidden />
    </Link>
  );
}
