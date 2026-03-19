import { SuiteCard } from "./SuiteCard";
import type { getSuitesByEstablishment } from "../queries/get-suites-by-establishment";

type SuiteListProps = {
  suites: Awaited<ReturnType<typeof getSuitesByEstablishment>>;
};

export function SuiteList({ suites }: SuiteListProps) {
  if (suites.length === 0) {
    return <p className="text-muted-foreground">Aucune suite disponible.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {suites.map((suite) => (
        <SuiteCard key={suite.id} suite={suite} />
      ))}
    </div>
  );
}
