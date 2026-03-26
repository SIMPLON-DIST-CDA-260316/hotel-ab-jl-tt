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
  const formattedMinPrice = establishment.minPrice
    ? `${Number(establishment.minPrice).toLocaleString("fr-FR")} €`
    : null;

  return (
    <Link
      href={`/establishments/${establishment.id}`}
      className="group block w-64 flex-shrink-0 overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md md:w-72"
    >
      <div className="relative aspect-[16/10] bg-gray-200">
        {establishment.image ? (
          <Image
            src={establishment.image}
            alt={establishment.name}
            fill
            className="object-cover"
            sizes="288px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Photo à venir
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold leading-tight group-hover:underline">
            {establishment.name}
          </h3>
          {establishment.suiteCount > 0 && (
            <Badge variant="secondary" className="flex-shrink-0 text-xs">
              {establishment.suiteCount}{" "}
              {establishment.suiteCount > 1 ? "suites" : "suite"}
            </Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {establishment.city}
        </p>
        {formattedMinPrice && (
          <p className="mt-2 text-sm">
            <span className="font-semibold">{formattedMinPrice}</span>
            <span className="text-muted-foreground"> / nuit</span>
          </p>
        )}
      </div>
    </Link>
  );
}
