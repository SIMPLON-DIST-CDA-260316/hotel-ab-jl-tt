import { Alert, AlertDescription } from "@/components/ui/alert";
import { SuiteSearchCard } from "@/features/search/components/SuiteSearchCard";
import type { SuiteSearchResult } from "@/features/search/types/search.types";

interface SuiteSearchGridProps {
  suites: SuiteSearchResult[];
}

export function SuiteSearchGrid({ suites }: SuiteSearchGridProps) {
  if (suites.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          Aucune suite ne correspond à vos critères. Essayez de modifier vos
          filtres.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        {suites.length} suite{suites.length > 1 ? "s" : ""} disponible
        {suites.length > 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {suites.map((suiteResult) => (
          <SuiteSearchCard key={suiteResult.id} suite={suiteResult} />
        ))}
      </div>
    </div>
  );
}
