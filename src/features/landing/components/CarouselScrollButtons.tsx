"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CarouselScrollButtonsProps {
  targetId: string;
}

const SCROLL_AMOUNT = 340;

export function CarouselScrollButtons({
  targetId,
}: CarouselScrollButtonsProps) {
  function scroll(direction: "left" | "right") {
    const container = document.getElementById(targetId);
    if (!container) return;
    const offset = direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
    container.scrollBy({ left: offset, behavior: "smooth" });
  }

  return (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full"
        onClick={() => scroll("left")}
        aria-label="Défiler vers la gauche"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full"
        onClick={() => scroll("right")}
        aria-label="Défiler vers la droite"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
