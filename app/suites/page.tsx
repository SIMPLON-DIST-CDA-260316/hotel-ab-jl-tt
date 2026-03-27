import { parseSearchParams } from "@/features/search/lib/search-params-schema";
import { searchSuites } from "@/features/search/queries/search-suites";
import { getFilterOptions } from "@/features/search/queries/get-filter-options";
import { FilterPanel } from "@/features/search/components/FilterPanel";
import { MobileFilterSheet } from "@/features/search/components/MobileFilterSheet";
import { SuiteSearchGrid } from "@/features/search/components/SuiteSearchGrid";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SuitesPage({ searchParams }: Props) {
  const rawParams = await searchParams;
  const validatedParams = parseSearchParams(rawParams);

  const [suites, filterOptions] = await Promise.all([
    searchSuites(validatedParams),
    getFilterOptions(),
  ]);

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Résultats de votre recherche</h1>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <FilterPanel filterOptions={filterOptions} />
        </aside>

        {/* Mobile filter trigger */}
        <MobileFilterSheet filterOptions={filterOptions} />

        {/* Results grid */}
        <div className="flex-1">
          <SuiteSearchGrid suites={suites} />
        </div>
      </div>
    </main>
  );
}
