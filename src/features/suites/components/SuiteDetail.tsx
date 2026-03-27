import Link from "next/link";
import { ChevronLeft, Users, Maximize } from "lucide-react";
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

      <div className="mx-auto max-w-7xl px-6">
        <nav className="py-5 text-xs text-muted-foreground" aria-label="Fil d'Ariane">
          <Link
            href={`/establishments/${suite.establishment.id}`}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-3.5 shrink-0" aria-hidden />
            {suite.establishment.name}
          </Link>
        </nav>

        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="mb-4 text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
              {suite.title}
            </h1>
            <div className="flex items-center gap-4 text-sm font-light text-muted-foreground">
              {suite.capacity > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-4 shrink-0" aria-hidden />
                  {suite.capacity} personne{suite.capacity > 1 ? "s" : ""}
                </span>
              )}
              {formattedArea && (
                <>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Maximize className="size-4 shrink-0" aria-hidden />
                    {formattedArea}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-semibold tracking-tight text-foreground">{formattedPrice}</p>
            <p className="text-sm font-light text-muted-foreground">/ nuit</p>
          </div>
        </div>

        <div className="flex items-start gap-20">
          <div className="min-w-0 flex-1">
            <SuiteSpecs amenities={suite.amenities} />

            {suite.description && (
              <section className="mb-10 border-b border-border pb-10" aria-labelledby="description-heading">
                <h2 id="description-heading" className="mb-6 text-2xl font-semibold text-foreground">
                  La suite
                </h2>
                <p className="whitespace-pre-line text-[15px] font-light leading-relaxed text-muted-foreground">
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
