import { EstablishmentCard } from "./EstablishmentCard";
import type { getEstablishments } from "../queries/get-establishments";

type EstablishmentListProps = {
  establishments: Awaited<ReturnType<typeof getEstablishments>>;
};

export function EstablishmentList({ establishments }: EstablishmentListProps) {
  if (establishments.length === 0) {
    return <p className="text-muted-foreground">Aucun établissement disponible.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {establishments.map((establishment) => (
        <EstablishmentCard key={establishment.id} establishment={establishment} />
      ))}
    </div>
  );
}
