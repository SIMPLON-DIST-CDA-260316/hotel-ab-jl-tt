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
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Voyageurs
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto justify-start p-0 text-sm font-normal shadow-none hover:bg-transparent"
          >
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            {value} voyageur{value > 1 ? "s" : ""}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48" align="start">
          <div className="flex items-center justify-between">
            <span className="text-sm">Voyageurs</span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onChange(Math.max(MIN_GUESTS, value - 1))}
                disabled={value <= MIN_GUESTS}
              >
                -
              </Button>
              <span className="w-4 text-center text-sm">{value}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onChange(Math.min(MAX_GUESTS, value + 1))}
                disabled={value >= MAX_GUESTS}
              >
                +
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
