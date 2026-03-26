import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { EstablishmentWithMinPrice } from "../queries/get-establishments-with-min-price";

interface EstablishmentCarouselCardProps {
  establishment: EstablishmentWithMinPrice;
}

export function EstablishmentCarouselCard({
  establishment,
}: EstablishmentCarouselCardProps) {
  const displayName = establishment.name.replace(/^Clair de Lune\s*[—–-]\s*/i, "");

  const formattedMinPrice = establishment.minPrice
    ? `À partir de ${Number(establishment.minPrice).toLocaleString("fr-FR")} € / nuit`
    : null;

  return (
    <Link
      href={`/establishments/${establishment.id}`}
      className="group relative block h-64 w-72 flex-shrink-0 overflow-hidden rounded-xl md:w-80"
    >
      {/* Image fills entire card */}
      <div className="absolute inset-0 bg-muted">
        {establishment.image ? (
          <Image
            src={establishment.image}
            alt={establishment.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="320px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Photo à venir
          </div>
        )}
      </div>

      {/* Gradient overlay — always visible at bottom, stronger on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/80" />

      {/* Content overlay — centered vertically, shifts down on hover */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-5 transition-all duration-300">
        <h3 className="text-base font-semibold text-white drop-shadow-md">
          {displayName}
        </h3>

        {/* Hover-only info */}
        <div className="mt-2 flex max-h-0 items-center gap-2 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-10 group-hover:opacity-100">
          {establishment.suiteCount > 0 && (
            <Badge
              variant="secondary"
              className="bg-white/20 text-xs text-white backdrop-blur-sm"
            >
              {establishment.suiteCount}{" "}
              {establishment.suiteCount > 1 ? "suites" : "suite"}
            </Badge>
          )}
          {formattedMinPrice && (
            <span className="text-xs text-white/90">{formattedMinPrice}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
