// TODO: type with suite domain type once schema is defined
export function SuiteDetail({ suite }: { suite: Record<string, unknown> }) {
  return (
    <div>
      <h1>{String(suite.nom ?? "")}</h1>
    </div>
  );
}
