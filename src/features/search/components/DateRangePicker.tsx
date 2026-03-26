"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  checkIn?: Date;
  checkOut?: Date;
  onDateChange: (range: { checkIn?: Date; checkOut?: Date }) => void;
}

export function DateRangePicker({
  checkIn,
  checkOut,
  onDateChange,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const dateRange: DateRange | undefined =
    checkIn || checkOut ? { from: checkIn, to: checkOut } : undefined;

  function handleSelect(range: DateRange | undefined): void {
    onDateChange({ checkIn: range?.from, checkOut: range?.to });
    if (range?.from && range?.to) {
      setOpen(false);
    }
  }

  function formatDateRange(): string {
    if (!checkIn) return "Quand ?";
    const checkInStr = format(checkIn, "d MMM", { locale: fr });
    if (!checkOut) return checkInStr;
    const checkOutStr = format(checkOut, "d MMM", { locale: fr });
    return `${checkInStr} — ${checkOutStr}`;
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Dates
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto justify-start p-0 text-sm font-normal shadow-none hover:bg-transparent"
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleSelect}
            numberOfMonths={2}
            disabled={{ before: new Date() }}
            locale={fr}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
