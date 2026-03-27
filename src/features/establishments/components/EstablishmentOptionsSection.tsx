import { Badge } from "@/components/ui/badge";
import { currencyFormatter } from "@/lib/formatters";
import type { PublicEstablishmentOption } from "../queries/get-establishment-public-options";

type EstablishmentOptionsSectionProps = {
  options: PublicEstablishmentOption[];
};

export function EstablishmentOptionsSection({
  options,
}: EstablishmentOptionsSectionProps) {
  if (options.length === 0) return null;

  return (
    <section aria-labelledby="establishment-options-heading" className="mb-8">
      <h2
        id="establishment-options-heading"
        className="mb-4 text-lg font-semibold"
      >
        Options disponibles
      </h2>
      <ul className="space-y-2">
        {options.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
          >
            <div className="flex items-center gap-2">
              {item.icon && (
                <span aria-hidden className="text-base">
                  {item.icon}
                </span>
              )}
              <div>
                <span className="font-medium">{item.name}</span>
                {item.description && (
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item.included ? (
                <Badge
                  variant="outline"
                  className="border-accent/30 text-accent-foreground"
                >
                  Inclus
                </Badge>
              ) : (
                <span className="font-medium">
                  {currencyFormatter.format(Number(item.price))}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
