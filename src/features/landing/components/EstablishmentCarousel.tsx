import Link from "next/link";
import { getEstablishmentsWithMinPrice } from "../queries/get-establishments-with-min-price";
import { EstablishmentCarouselCard } from "./EstablishmentCarouselCard";
import { CarouselScrollButtons } from "./CarouselScrollButtons";

export async function EstablishmentCarousel() {
  const establishments = await getEstablishmentsWithMinPrice();

  if (establishments.length === 0) return null;

  return (
    <section className="bg-secondary py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Nos établissements</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Découvrez nos maisons à travers la France
            </p>
          </div>
          <div className="hidden md:block">
            <CarouselScrollButtons targetId="establishment-carousel" />
          </div>
        </div>
        <div
          id="establishment-carousel"
          className="-mx-6 mt-8 flex gap-5 overflow-x-auto scroll-smooth px-6 pb-4 scrollbar-none"
        >
          {establishments.map((establishment) => (
            <EstablishmentCarouselCard
              key={establishment.id}
              establishment={establishment}
            />
          ))}
        </div>
        <div className="mt-6 text-right">
          <Link
            href="/establishments"
            className="text-sm font-semibold underline hover:no-underline"
          >
            Voir tous nos établissements →
          </Link>
        </div>
      </div>
    </section>
  );
}
