"use client";

import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DestinationInputProps {
  value: string;
  onChange: (value: string) => void;
  cities: string[];
}

export function DestinationInput({ value, onChange, cities }: DestinationInputProps) {
  return (
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger className="h-auto border-0 p-0 text-sm shadow-none focus:ring-0 [&>svg]:ml-1">
          <SelectValue placeholder="Destination" />
        </SelectTrigger>
        <SelectContent>
          {cities.map((city) => (
            <SelectItem key={city} value={city}>
              {city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
