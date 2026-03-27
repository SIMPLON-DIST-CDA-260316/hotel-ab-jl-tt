"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface GuestSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const MIN_GUESTS = 1;
const MAX_GUESTS = 10;

export function GuestSelector({ value, onChange }: GuestSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto justify-start gap-2 p-0 text-sm font-normal shadow-none hover:bg-transparent"
        >
          <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="whitespace-nowrap">{value} voy.</span>
        </Button>
        </PopoverTrigger>
        <PopoverContent className="w-52" align="end">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium">Voyageurs</span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => onChange(Math.max(MIN_GUESTS, value - 1))}
                disabled={value <= MIN_GUESTS}
                aria-label="Retirer un voyageur"
              >
                −
              </Button>
              <span className="w-6 text-center text-sm font-medium">{value}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => onChange(Math.min(MAX_GUESTS, value + 1))}
                disabled={value >= MAX_GUESTS}
                aria-label="Ajouter un voyageur"
              >
                +
              </Button>
            </div>
          </div>
        </PopoverContent>
    </Popover>
  );
}
