import { Button } from "@/components/ui/button";
import type { SuiteAmenity } from "../queries/get-suite-with-details";

type SuiteAmenitiesProps = {
  amenities: SuiteAmenity[];
};

export function SuiteAmenities({ amenities }: SuiteAmenitiesProps) {
  if (amenities.length === 0) return null;

  return (
    <section className="border-b border-zinc-100 pb-10 mb-10" aria-labelledby="amenities-heading">
      <h2 id="amenities-heading" className="font-serif text-2xl font-semibold text-zinc-900 mb-6">
        Équipements
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {amenities.map((item) => (
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
        Voir tous les équipements ({amenities.length})
      </Button>
    </section>
  );
}
