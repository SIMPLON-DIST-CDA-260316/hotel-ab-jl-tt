import { EtablissementCard } from "./EtablissementCard";
import type { getEtablissements } from "../queries/get-etablissements";

type EtablissementListProps = {
  etablissements: Awaited<ReturnType<typeof getEtablissements>>;
};

export function EtablissementList({ etablissements }: EtablissementListProps) {
  if (etablissements.length === 0) {
    return <p className="text-muted-foreground">Aucun établissement disponible.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {etablissements.map((etablissement) => (
        <EtablissementCard key={etablissement.id} etablissement={etablissement} />
      ))}
    </div>
  );
}
