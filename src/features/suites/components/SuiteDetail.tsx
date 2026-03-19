// TODO: type with suite domain type once schema is defined
type SuiteDetailProps = {
  suite: Record<string, unknown>;
};

export function SuiteDetail({ suite }: SuiteDetailProps) {
  return (
    <div>
      <h1>{String(suite.nom ?? "")}</h1>
    </div>
  );
}
