"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FilterPanel } from "@/features/search/components/FilterPanel";
import type { FilterOptions } from "@/features/search/types/search.types";

interface MobileFilterSheetProps {
  filterOptions: FilterOptions;
}

export function MobileFilterSheet({ filterOptions }: MobileFilterSheetProps) {
  return (
    <div className="mb-4 lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filtres
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-2xl">
          <div className="px-6 pb-8">
            <SheetHeader className="px-0 pb-4">
              <SheetTitle>Filtres</SheetTitle>
            </SheetHeader>
            <FilterPanel filterOptions={filterOptions} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
