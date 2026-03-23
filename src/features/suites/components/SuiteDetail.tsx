import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SuiteGallery } from "./SuiteGallery";
import type { SuiteWithDetails } from "../queries/get-suite-with-details";

type SuiteDetailProps = {
  suite: SuiteWithDetails;
};

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function SuiteDetail({ suite }: SuiteDetailProps) {
  const formattedPrice = priceFormatter.format(Number(suite.price));
  const formattedArea = suite.area ? `${Number(suite.area).toFixed(0)} m²` : null;

  return (
    <div>
      <SuiteGallery
        mainImage={suite.mainImage}
        images={suite.images}
        title={suite.title}
      />

      <div className="max-w-5xl mx-auto px-4 md:px-10">
        {/* Breadcrumb */}
        <nav className="py-5 text-xs text-zinc-400" aria-label="Fil d'Ariane">
          <Link
            href={`/establishments/${suite.establishment.id}`}
            className="inline-flex items-center gap-1.5 hover:text-zinc-700 transition-colors"
          >
            <svg
              className="size-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {suite.establishment.name}
          </Link>
        </nav>

        {/* Title + Price row */}
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-zinc-900 leading-tight tracking-tight mb-4">
              {suite.title}
            </h1>
            <div className="flex items-center gap-4 text-zinc-400 text-sm font-light">
              {suite.capacity > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  {suite.capacity} personne{suite.capacity > 1 ? "s" : ""}
                </span>
              )}
              {formattedArea && (
                <>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                      <path d="M3 3h18v18H3z" /><path d="M3 9h18M9 21V9" />
                    </svg>
                    {formattedArea}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-bold text-zinc-900 tracking-tight">
              {formattedPrice}
            </p>
            <p className="text-sm font-light text-zinc-400">/ nuit</p>
          </div>
        </div>

        <div className="flex gap-20 items-start">
          {/* Main content column */}
          <div className="flex-1 min-w-0">
            {/* Specs strip */}
            {suite.amenities.length > 0 && (
              <div className="border-y border-zinc-100 py-6 mb-8 flex items-center gap-6 text-sm text-zinc-400 font-light flex-wrap">
                {suite.amenities.slice(0, 3).map((item, index) => (
                  <span key={item.id} className="inline-flex items-center gap-2">
                    {index > 0 && <span aria-hidden className="text-zinc-200 mr-4">|</span>}
                    {item.icon && <span aria-hidden>{item.icon}</span>}
                    {item.name}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {suite.description && (
              <section className="border-b border-zinc-100 pb-10 mb-10" aria-labelledby="description-heading">
                <h2 id="description-heading" className="font-serif text-2xl font-semibold text-zinc-900 mb-6">
                  La suite
                </h2>
                <p className="text-zinc-500 font-light leading-relaxed text-[15px] whitespace-pre-line">
                  {suite.description}
                </p>
              </section>
            )}

            {/* Amenities */}
            {suite.amenities.length > 0 && (
              <section className="border-b border-zinc-100 pb-10 mb-10" aria-labelledby="amenities-heading">
                <h2 id="amenities-heading" className="font-serif text-2xl font-semibold text-zinc-900 mb-6">
                  Équipements
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {suite.amenities.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 text-sm text-zinc-500 font-light">
                      <span className="shrink-0 size-10 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-center text-zinc-400">
                        {item.icon ? (
                          <span aria-hidden className="text-base">{item.icon}</span>
                        ) : (
                          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
                            <circle cx="12" cy="12" r="9" />
                          </svg>
                        )}
                      </span>
                      {item.name}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="rounded-xl">
                  Voir tous les équipements ({suite.amenities.length})
                </Button>
              </section>
            )}

            {/* Establishment */}
            <section className="border-b border-zinc-100 pb-10 mb-10" aria-labelledby="establishment-heading">
              <Link
                href={`/establishments/${suite.establishment.id}`}
                className="flex items-start gap-6 group"
              >
                <div className="shrink-0 size-24 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-300">
                  <svg className="size-8" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24" aria-hidden>
                    <rect x="3" y="3" width="18" height="18" rx="1" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-zinc-400 tracking-widest uppercase mb-1">
                    L&apos;établissement
                  </p>
                  <h2 id="establishment-heading" className="text-base font-semibold text-zinc-800 mb-2">
                    {suite.establishment.name}
                  </h2>
                  <p className="text-sm font-light text-zinc-400 group-hover:text-zinc-600 transition-colors inline-flex items-center gap-1 underline underline-offset-2">
                    Voir l&apos;établissement
                    <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </p>
                </div>
              </Link>
            </section>
          </div>

          {/* Booking sidebar — desktop only, static placeholder */}
          <aside className="hidden lg:block w-[340px] shrink-0 sticky top-8" aria-label="Réservation">
            <Card className="rounded-xl shadow-sm">
              <CardContent className="p-0">
                <div className="border border-zinc-200 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-2 divide-x divide-zinc-100">
                    <div className="p-4 flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-zinc-300 tracking-widest uppercase">Arrivée</span>
                      <span className="text-sm font-medium text-zinc-800">— mars 2026</span>
                    </div>
                    <div className="p-4 flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-zinc-300 tracking-widest uppercase">Départ</span>
                      <span className="text-sm font-medium text-zinc-800">— mars 2026</span>
                    </div>
                  </div>
                  <div className="border-t border-zinc-100 p-4 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-zinc-300 tracking-widest uppercase">Voyageurs</span>
                      <span className="text-sm font-medium text-zinc-800">
                        {suite.capacity} voyageur{suite.capacity > 1 ? "s" : ""}
                      </span>
                    </div>
                    <svg className="size-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                <div className="pt-4 px-0 space-y-3">
                  <Button className="w-full h-12 rounded-xl font-semibold" asChild>
                    <Link href="/sign-in">Se connecter pour réserver</Link>
                  </Button>
                  <p className="text-center text-[11px] text-zinc-400 flex items-center justify-center gap-1.5">
                    <svg className="size-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Annulation gratuite disponible
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
