"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { currencyFormatter } from "@/lib/formatters";
import type { AvailabilityResult } from "@/types/availability.types";

type SuiteBookingSidebarProps = {
  suiteId: string;
  capacity: number;
  pricePerNight: number;
  isAuthenticated: boolean;
};

export function SuiteBookingSidebar({
  suiteId,
  capacity,
  pricePerNight,
  isAuthenticated,
}: SuiteBookingSidebarProps) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [availability, setAvailability] = useState<AvailabilityResult | null>(
    null,
  );
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayISO = new Date().toISOString().split("T")[0];
  const hasDates = checkIn !== "" && checkOut !== "";

  async function handleCheckAvailability() {
    if (!hasDates) return;

    setIsChecking(true);
    setError(null);
    setAvailability(null);

    try {
      const response = await fetch(
        `/api/bookings/availability?suiteId=${suiteId}&checkIn=${checkIn}&checkOut=${checkOut}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error ?? "Erreur lors de la vérification");
        return;
      }

      const availabilityData: AvailabilityResult = await response.json();
      setAvailability(availabilityData);
    } catch {
      setError("Erreur de connexion");
    } finally {
      setIsChecking(false);
    }
  }

  function resetAvailability() {
    setAvailability(null);
    setError(null);
  }

  // Query params in dynamic URLs are not recognized by typed routes
  const bookingUrl = `/suites/${suiteId}/book?checkIn=${checkIn}&checkOut=${checkOut}&guestCount=${guestCount}` as unknown as "/suites/[id]/book";

  return (
    <aside
      className="hidden w-[340px] shrink-0 lg:block"
      aria-label="Réservation"
    >
      <div className="sticky top-8">
        <Card className="rounded-xl shadow-sm">
          <CardContent className="space-y-4 p-5">
            {/* Price */}
            <div>
              <span className="text-2xl font-bold tracking-tight">
                {currencyFormatter.format(pricePerNight)}
              </span>
              <span className="text-sm font-light text-muted-foreground">
                {" "}
                / nuit
              </span>
            </div>

            <Separator />

            {/* Date inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sidebar-checkIn" className="text-xs">
                  Arrivée
                </Label>
                <Input
                  id="sidebar-checkIn"
                  type="date"
                  min={todayISO}
                  value={checkIn}
                  onChange={(event) => {
                    setCheckIn(event.target.value);
                    resetAvailability();
                  }}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="sidebar-checkOut" className="text-xs">
                  Départ
                </Label>
                <Input
                  id="sidebar-checkOut"
                  type="date"
                  min={checkIn || todayISO}
                  value={checkOut}
                  onChange={(event) => {
                    setCheckOut(event.target.value);
                    resetAvailability();
                  }}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Guest count */}
            <div>
              <Label htmlFor="sidebar-guestCount" className="text-xs">
                Voyageurs
              </Label>
              <Input
                id="sidebar-guestCount"
                type="number"
                min={1}
                max={capacity}
                value={guestCount}
                onChange={(event) =>
                  setGuestCount(Number(event.target.value))
                }
                className="text-sm"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {capacity} max.
              </p>
            </div>

            {/* Availability check */}
            {!availability && (
              <Button
                className="h-11 w-full rounded-xl font-semibold"
                onClick={handleCheckAvailability}
                disabled={!hasDates || isChecking}
              >
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  "Vérifier la disponibilité"
                )}
              </Button>
            )}

            {/* Error */}
            {error && (
              <p className="text-center text-sm text-destructive">{error}</p>
            )}

            {/* Result */}
            {availability && (
              <div
                className={`rounded-lg border p-3 text-sm ${
                  availability.available
                    ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                    : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
                }`}
              >
                {availability.available ? (
                  <div className="space-y-1">
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Disponible
                    </p>
                    <p className="text-green-700 dark:text-green-300">
                      {availability.nightCount} nuit
                      {availability.nightCount > 1 ? "s" : ""} ·{" "}
                      <span className="font-semibold">
                        {currencyFormatter.format(availability.totalPrice)}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="font-medium text-red-800 dark:text-red-200">
                    Non disponible sur ces dates
                  </p>
                )}
              </div>
            )}

            {/* Book button */}
            {availability?.available &&
              (isAuthenticated ? (
                <Button
                  className="h-11 w-full rounded-xl font-semibold"
                  asChild
                >
                  <Link href={bookingUrl}>Réserver</Link>
                </Button>
              ) : (
                <Button
                  className="h-11 w-full rounded-xl font-semibold"
                  asChild
                >
                  <Link href={`/sign-in?callbackUrl=${encodeURIComponent(`/suites/${suiteId}/book?checkIn=${checkIn}&checkOut=${checkOut}&guestCount=${guestCount}`)}`}>
                    Se connecter pour réserver
                  </Link>
                </Button>
              ))}

            <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
              <svg
                className="size-3"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Annulation gratuite disponible
            </p>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
