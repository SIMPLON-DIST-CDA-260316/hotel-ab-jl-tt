"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { EstablishmentWithMinPrice } from "../queries/get-establishments-with-min-price";

function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

function getDayAfterTomorrowDate(): string {
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  return dayAfter.toISOString().split("T")[0];
}

interface HeroSearchCardProps {
  establishments: EstablishmentWithMinPrice[];
}

export function HeroSearchCard({ establishments }: HeroSearchCardProps) {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState(getTomorrowDate);
  const [checkOut, setCheckOut] = useState(getDayAfterTomorrowDate);
  const [guests, setGuests] = useState("1");
  const [withBaby, setWithBaby] = useState(false);
  const [withPet, setWithPet] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", guests);
    if (withBaby) params.set("baby", "true");
    if (withPet) params.set("pet", "true");
    const searchUrl = `/suites?${params.toString()}`;
    router.push(searchUrl as Parameters<typeof router.push>[0]);
  }

  const inputClassName =
    "mt-1 flex h-9 w-full rounded-md border border-accent/40 bg-accent/10 px-3 py-1 text-sm text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-5 rounded-2xl border border-accent/40 bg-[rgba(0,0,0,0.55)] p-7 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl md:w-96"
    >
      <h2 className="text-base font-semibold text-primary-foreground">
        Réservez votre séjour
      </h2>

      <div>
        <Label
          htmlFor="hero-destination"
          className="text-xs font-medium text-accent"
        >
          Destination
        </Label>
        <select
          id="hero-destination"
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          className={inputClassName}
        >
          <option value="" className="text-foreground">
            Tous les établissements
          </option>
          {establishments.map((establishment) => (
            <option
              key={establishment.id}
              value={establishment.city}
              className="text-foreground"
            >
              {establishment.name.replace(/^Clair de Lune\s*[—–-]\s*/i, "")}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label
            htmlFor="hero-check-in"
            className="text-xs font-medium text-accent"
          >
            Arrivée
          </Label>
          <input
            id="hero-check-in"
            type="date"
            value={checkIn}
            onChange={(event) => setCheckIn(event.target.value)}
            className={inputClassName}
          />
        </div>
        <div>
          <Label
            htmlFor="hero-check-out"
            className="text-xs font-medium text-accent"
          >
            Départ
          </Label>
          <input
            id="hero-check-out"
            type="date"
            value={checkOut}
            onChange={(event) => setCheckOut(event.target.value)}
            className={inputClassName}
          />
        </div>
      </div>

      <div>
        <Label
          htmlFor="hero-guests"
          className="text-xs font-medium text-accent"
        >
          Voyageurs
        </Label>
        <input
          id="hero-guests"
          type="number"
          min="1"
          max="10"
          value={guests}
          onChange={(event) => setGuests(event.target.value)}
          className={inputClassName}
        />
      </div>

      <div className="flex gap-5">
        <div className="flex items-center gap-2">
          <Checkbox
            id="hero-baby"
            checked={withBaby}
            onCheckedChange={(checked) => setWithBaby(checked === true)}
            className="border-accent/50 data-[state=checked]:border-accent data-[state=checked]:bg-accent"
          />
          <Label
            htmlFor="hero-baby"
            className="cursor-pointer text-xs text-white/70"
          >
            Lit bébé
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="hero-pet"
            checked={withPet}
            onCheckedChange={(checked) => setWithPet(checked === true)}
            className="border-accent/50 data-[state=checked]:border-accent data-[state=checked]:bg-accent"
          />
          <Label
            htmlFor="hero-pet"
            className="cursor-pointer text-xs text-white/70"
          >
            Animal
          </Label>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full bg-accent font-bold text-accent-foreground hover:bg-accent/90"
      >
        Rechercher
      </Button>
    </form>
  );
}
