import Link from "next/link";
import { getEstablishmentsWithMinPrice } from "../queries/get-establishments-with-min-price";
import { EstablishmentCarouselCard } from "./EstablishmentCarouselCard";

export async function EstablishmentCarousel() {
  const establishments = await getEstablishmentsWithMinPrice();

  if (establishments.length === 0) return null;

  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Nos établissements</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Découvrez nos maisons à travers la France
            </p>
          </div>
          <Link
            href="/establishments"
            className="text-sm font-medium underline hover:no-underline"
          >
            Voir tous →
          </Link>
        </div>
        <div className="-mx-6 mt-8 flex gap-4 overflow-x-auto px-6 pb-4">
          {establishments.map((establishment) => (
            <EstablishmentCarouselCard
              key={establishment.id}
              establishment={establishment}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
