"use client";

import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DestinationInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function DestinationInput({ value, onChange }: DestinationInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Destination
      </span>
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Où allez-vous ?"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-auto border-0 p-0 text-sm shadow-none focus-visible:ring-0"
        />
      </div>
    </div>
  );
}
