import Link from "next/link";
import { priceFormatter } from "@/lib/formatters";
import { SuiteGallery } from "./SuiteGallery";
import { SuiteSpecs } from "./SuiteSpecs";
import { SuiteAmenities } from "./SuiteAmenities";
import { SuiteEstablishmentCard } from "./SuiteEstablishmentCard";
import { SuiteBookingSidebar } from "./SuiteBookingSidebar";
import type { SuiteWithDetails } from "../queries/get-suite-with-details";

type SuiteDetailProps = {
  suite: SuiteWithDetails;
  isAuthenticated: boolean;
};

export function SuiteDetail({ suite, isAuthenticated }: SuiteDetailProps) {
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
        <nav className="py-5 text-xs text-zinc-400" aria-label="Fil d'Ariane">
          <Link
            href={`/establishments/${suite.establishment.id}`}
            className="inline-flex items-center gap-1.5 hover:text-zinc-700 transition-colors"
          >
            <svg className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {suite.establishment.name}
          </Link>
        </nav>

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
            <p className="text-2xl font-bold text-zinc-900 tracking-tight">{formattedPrice}</p>
            <p className="text-sm font-light text-zinc-400">/ nuit</p>
          </div>
        </div>

        <div className="flex gap-20 items-start">
          <div className="flex-1 min-w-0">
            <SuiteSpecs amenities={suite.amenities} />

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

            <SuiteAmenities amenities={suite.amenities} />
            <SuiteEstablishmentCard establishment={suite.establishment} />
          </div>

          <SuiteBookingSidebar suiteId={suite.id} capacity={suite.capacity} pricePerNight={Number(suite.price)} isAuthenticated={isAuthenticated} />
        </div>
      </div>
    </div>
  );
}
