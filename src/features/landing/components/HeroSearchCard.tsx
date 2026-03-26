"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EstablishmentWithMinPrice } from "../queries/get-establishments-with-min-price";

function getTomorrow(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

function getDayAfterTomorrow(): Date {
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  return dayAfter;
}

interface HeroSearchCardProps {
  establishments: EstablishmentWithMinPrice[];
}

export function HeroSearchCard({ establishments }: HeroSearchCardProps) {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState<Date>(getTomorrow);
  const [checkOut, setCheckOut] = useState<Date>(getDayAfterTomorrow);
  const [guests, setGuests] = useState("1");
  const [withBaby, setWithBaby] = useState(false);
  const [withPet, setWithPet] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (checkIn) params.set("checkIn", checkIn.toISOString().split("T")[0]);
    if (checkOut) params.set("checkOut", checkOut.toISOString().split("T")[0]);
    if (guests) params.set("guests", guests);
    if (withBaby) params.set("baby", "true");
    if (withPet) params.set("pet", "true");
    const searchUrl = `/suites?${params.toString()}`;
    router.push(searchUrl as Parameters<typeof router.push>[0]);
  }

  const triggerClassName =
    "w-full !border-accent-light bg-accent-light/10 !text-white focus-visible:!border-accent-light focus-visible:ring-accent-light/50 [&_svg]:!text-accent-light";

  return (
    <Card className="w-full !border-accent-light bg-[rgba(0,0,0,0.55)] shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl md:w-96">
      <CardHeader>
        <CardTitle className="text-base text-primary-foreground">
          Réservez votre séjour
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Destination */}
          <div>
            <Label className="text-xs font-semibold text-white/90">
              Destination
            </Label>
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger className={`mt-1 ${triggerClassName}`}>
                <SelectValue placeholder="Tous les établissements" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les établissements</SelectItem>
                {establishments.map((establishment) => (
                  <SelectItem
                    key={establishment.id}
                    value={establishment.city}
                  >
                    {establishment.name.replace(
                      /^Clair de Lune\s*[—–-]\s*/i,
                      ""
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-white/90">Arrivée</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`mt-1 w-full justify-start text-left font-normal ${triggerClassName}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(checkIn, "dd MMM", { locale: fr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={(date) => date && setCheckIn(date)}
                    disabled={(date) => date < new Date()}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-xs font-semibold text-white/90">Départ</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`mt-1 w-full justify-start text-left font-normal ${triggerClassName}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(checkOut, "dd MMM", { locale: fr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={(date) => date && setCheckOut(date)}
                    disabled={(date) => date <= checkIn}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Voyageurs */}
          <div>
            <Label className="text-xs font-semibold text-white/90">
              Voyageurs
            </Label>
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger className={`mt-1 ${triggerClassName}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, index) => (
                  <SelectItem key={index + 1} value={String(index + 1)}>
                    {index + 1} {index === 0 ? "voyageur" : "voyageurs"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Options rapides */}
          <div className="flex gap-5">
            <div className="flex items-center gap-2">
              <Checkbox
                id="hero-baby"
                checked={withBaby}
                onCheckedChange={(checked) => setWithBaby(checked === true)}
                className="!border-accent-light data-[state=checked]:!border-accent-light data-[state=checked]:!bg-accent-light"
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
                className="!border-accent-light data-[state=checked]:!border-accent-light data-[state=checked]:!bg-accent-light"
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
            className="w-full bg-accent text-base font-bold text-accent-foreground hover:bg-accent/90"
          >
            Rechercher
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
