"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DestinationInput } from "@/features/search/components/DestinationInput";
import { DateRangePicker } from "@/features/search/components/DateRangePicker";
import { GuestSelector } from "@/features/search/components/GuestSelector";

const DEFAULT_GUEST_COUNT = 1;

function parseDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

export function SearchBar(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  function handleSearch(): void {
    const params = new URLSearchParams();

    if (destination) {
      params.set("destination", destination);
      params.set("locations", destination);
    }
    if (checkIn) params.set("checkIn", checkIn.toISOString());
    if (checkOut) params.set("checkOut", checkOut.toISOString());
    params.set("guests", String(guestCount));

    router.push(`/suites?${params.toString()}`);
  }

  return (
    <div className="flex items-center rounded-full border bg-background shadow-sm">
      <div className="px-6 py-3">
        <DestinationInput value={destination} onChange={setDestination} />
      </div>

      <Separator orientation="vertical" className="h-8" />

      <div className="px-6 py-3">
        <DateRangePicker
          checkIn={checkIn}
          checkOut={checkOut}
          onDateChange={handleDateChange}
        />
      </div>

      <Separator orientation="vertical" className="h-8" />

      <div className="flex items-center gap-2 pl-6 pr-3 py-3">
        <GuestSelector value={guestCount} onChange={setGuestCount} />
        <Button
          onClick={handleSearch}
          size="icon"
          className="ml-2 h-9 w-9 shrink-0 rounded-full"
          aria-label="Rechercher"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
