"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DestinationInput } from "@/features/search/components/DestinationInput";
import { DateRangePicker } from "@/features/search/components/DateRangePicker";
import { GuestSelector } from "@/features/search/components/GuestSelector";

const DEFAULT_GUEST_COUNT = 1;

function parseDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

export function SearchBarMobile(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [destination, setDestination] = useState(
    searchParams.get("destination") ?? ""
  );
  const [checkIn, setCheckIn] = useState<Date | undefined>(
    parseDate(searchParams.get("checkIn"))
  );
  const [checkOut, setCheckOut] = useState<Date | undefined>(
    parseDate(searchParams.get("checkOut"))
  );
  const [guestCount, setGuestCount] = useState(
    Number(searchParams.get("guests")) || DEFAULT_GUEST_COUNT
  );

  function handleDateChange(range: {
    checkIn?: Date;
    checkOut?: Date;
  }): void {
    setCheckIn(range.checkIn);
    setCheckOut(range.checkOut);
  }

  function buildSummary(): string {
    const parts: string[] = [];

    if (destination) parts.push(destination);

    if (checkIn) {
      const checkInLabel = format(checkIn, "d MMM", { locale: fr });
      const checkOutLabel = checkOut
        ? format(checkOut, "d MMM", { locale: fr })
        : undefined;
      parts.push(checkOutLabel ? `${checkInLabel}–${checkOutLabel}` : checkInLabel);
    }

    parts.push(`${guestCount} voy.`);

    return parts.join(" · ");
  }

  function handleSearch(): void {
    const params = new URLSearchParams();

    if (destination) {
      params.set("destination", destination);
      params.set("locations", destination);
    }
    if (checkIn) params.set("checkIn", checkIn.toISOString());
    if (checkOut) params.set("checkOut", checkOut.toISOString());
    params.set("guests", String(guestCount));

    setIsSheetOpen(false);
    router.push(`/suites?${params.toString()}`);
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm"
        >
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{buildSummary()}</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="rounded-t-2xl px-6 pb-8 pt-6">
        <SheetHeader className="p-0 pb-6">
          <SheetTitle>Rechercher un séjour</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6">
          <DestinationInput value={destination} onChange={setDestination} />
          <DateRangePicker
            checkIn={checkIn}
            checkOut={checkOut}
            onDateChange={handleDateChange}
          />
          <GuestSelector value={guestCount} onChange={setGuestCount} />
        </div>

        <SheetFooter className="p-0 pt-8">
          <Button onClick={handleSearch} className="w-full gap-2">
            <Search className="h-4 w-4" />
            Rechercher
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
