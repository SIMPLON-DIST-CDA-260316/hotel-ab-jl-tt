import type { SuiteAmenity } from "../queries/get-suite-with-details";

type SuiteSpecsProps = {
  amenities: SuiteAmenity[];
};

export function SuiteSpecs({ amenities }: SuiteSpecsProps) {
  if (amenities.length === 0) return null;

  return (
    <div className="border-y border-zinc-100 py-6 mb-8 flex items-center gap-6 text-sm text-zinc-400 font-light flex-wrap">
      {amenities.slice(0, 3).map((item, index) => (
        <span key={item.id} className="inline-flex items-center gap-2">
          {index > 0 && <span aria-hidden className="text-zinc-200 mr-4">|</span>}
          {item.icon && <span aria-hidden>{item.icon}</span>}
          {item.name}
        </span>
      ))}
    </div>
  );
}
