"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function HeroSearchCard() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", guests);
    router.push(`/suites?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-4 rounded-xl border border-white/20 bg-[rgba(255,255,255,0.12)] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl md:w-72"
    >
      <h2 className="text-sm font-semibold text-white">
        Réservez votre séjour
      </h2>

      <div>
        <Label htmlFor="hero-destination" className="text-xs text-white/70">
          Destination
        </Label>
        <Input
          id="hero-destination"
          placeholder="Région, département..."
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          className="mt-1 border-white/20 bg-white/15 text-white placeholder:text-white/50"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="hero-check-in" className="text-xs text-white/70">
            Arrivée
          </Label>
          <Input
            id="hero-check-in"
            type="date"
            value={checkIn}
            onChange={(event) => setCheckIn(event.target.value)}
            className="mt-1 border-white/20 bg-white/15 text-white"
          />
        </div>
        <div>
          <Label htmlFor="hero-check-out" className="text-xs text-white/70">
            Départ
          </Label>
          <Input
            id="hero-check-out"
            type="date"
            value={checkOut}
            onChange={(event) => setCheckOut(event.target.value)}
            className="mt-1 border-white/20 bg-white/15 text-white"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="hero-guests" className="text-xs text-white/70">
          Voyageurs
        </Label>
        <Input
          id="hero-guests"
          type="number"
          min="1"
          placeholder="Nombre de personnes"
          value={guests}
          onChange={(event) => setGuests(event.target.value)}
          className="mt-1 border-white/20 bg-white/15 text-white placeholder:text-white/50"
        />
      </div>

      <Button type="submit" variant="secondary" className="mt-2 w-full">
        Rechercher
      </Button>
    </form>
  );
}
