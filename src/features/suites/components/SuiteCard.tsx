// TODO: type with suite domain type once schema is defined
export function SuiteCard({ suite }: { suite: Record<string, unknown> }) {
  return (
    <div>
      <p>{String(suite.nom ?? "")}</p>
    </div>
  );
}
