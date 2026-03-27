import type { SuiteAmenity } from "../queries/get-suite-with-details";

type SuiteSpecsProps = {
  amenities: SuiteAmenity[];
};

export function SuiteSpecs({ amenities }: SuiteSpecsProps) {
  if (amenities.length === 0) return null;

  return (
    <div className="mb-8 flex flex-wrap items-center gap-6 border-y border-border py-6 text-sm font-light text-muted-foreground">
      {amenities.slice(0, 3).map((item, index) => (
        <span key={item.id} className="inline-flex items-center gap-2">
          {index > 0 && <span aria-hidden className="mr-4 text-border">|</span>}
          {item.icon && <span aria-hidden>{item.icon}</span>}
          {item.name}
        </span>
      ))}
    </div>
  );
}
