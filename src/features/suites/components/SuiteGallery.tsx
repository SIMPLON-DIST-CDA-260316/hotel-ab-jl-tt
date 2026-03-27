"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Slide = {
  url: string;
  alt: string | null;
};

type SuiteGalleryProps = {
  mainImage: string;
  images: { url: string; alt: string | null; position: number }[];
  title: string;
};

type GalleryNavProps = {
  direction: "prev" | "next";
  onClick: () => void;
};

function GalleryNav({ direction, onClick }: GalleryNavProps) {
  const isPrev = direction === "prev";
  return (
    <Button
      onClick={onClick}
      aria-label={isPrev ? "Image précédente" : "Image suivante"}
      variant="outline"
      size="icon"
      className={`absolute ${isPrev ? "left-4" : "right-4"} top-1/2 size-11 -translate-y-1/2 rounded-full bg-white/90 shadow-md backdrop-blur-sm hover:bg-white`}
    >
      {isPrev ? (
        <ChevronLeft className="size-5 text-foreground" aria-hidden />
      ) : (
        <ChevronRight className="size-5 text-foreground" aria-hidden />
      )}
    </Button>
  );
}

type GalleryDotsProps = {
  count: number;
  currentIndex: number;
  onSelect: (index: number) => void;
};

function GalleryDots({ count, currentIndex, onSelect }: GalleryDotsProps) {
  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 items-center"
      role="tablist"
      aria-label="Navigation galerie"
    >
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          role="tab"
          aria-selected={index === currentIndex}
          aria-label={`Image ${index + 1}`}
          onClick={() => onSelect(index)}
          className={
            index === currentIndex
              ? "w-6 h-1.5 rounded-full bg-white transition-all"
              : "w-1.5 h-1.5 rounded-full bg-white/50 transition-all"
          }
        />
      ))}
    </div>
  );
}

export function SuiteGallery({ mainImage, images, title }: SuiteGalleryProps) {
  const slides: Slide[] = [
    { url: mainImage, alt: title },
    ...images.map((img) => ({ url: img.url, alt: img.alt })),
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrev = () =>
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  const goToNext = () =>
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative h-[400px] w-full overflow-hidden bg-muted md:h-[560px]">
      <Image
        key={currentIndex}
        src={currentSlide.url}
        alt={currentSlide.alt ?? title}
        fill
        className="object-cover"
        priority={currentIndex === 0}
      />

      {slides.length > 1 && (
        <>
          <GalleryNav direction="prev" onClick={goToPrev} />
          <GalleryNav direction="next" onClick={goToNext} />
          <GalleryDots count={slides.length} currentIndex={currentIndex} onSelect={setCurrentIndex} />
          <div className="absolute bottom-4 right-6 bg-black/50 text-white text-xs font-medium px-3 py-1 rounded-md">
            {currentIndex + 1} / {slides.length}
          </div>
        </>
      )}
    </div>
  );
}
