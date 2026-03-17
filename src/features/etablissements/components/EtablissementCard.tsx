// TODO: type with etablissement domain type once schema is defined
export function EtablissementCard({ etablissement }: { etablissement: Record<string, unknown> }) {
  return (
    <div>
      <p>{String(etablissement.nom ?? "")}</p>
    </div>
  );
}
