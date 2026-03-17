import { EtablissementCard } from "./EtablissementCard";

export function EtablissementList({ etablissements }: { etablissements: Record<string, unknown>[] }) {
  return (
    <ul>
      {etablissements.map((e, i) => (
        <li key={i}>
          <EtablissementCard etablissement={e} />
        </li>
      ))}
    </ul>
  );
}
