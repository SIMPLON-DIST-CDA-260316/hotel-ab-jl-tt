import { Suspense } from "react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getFilterOptions } from "@/features/search/queries/get-filter-options";
import { SearchBar } from "@/features/search/components/SearchBar";
import { SearchBarMobile } from "@/features/search/components/SearchBarMobile";
import { UserMenu } from "@/components/layout/UserMenu";
import { HeaderSearchVisibility } from "@/components/layout/HeaderSearchVisibility";

export async function Header() {
  const [session, filterOptions] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getFilterOptions(),
  ]);

  return (
    <header className="border-b px-4 py-3 md:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-3 text-xl font-bold">
          <Image
            src="/images/logo.svg"
            alt="Clair de Lune"
            width={36}
            height={36}
          />
          <span className="hidden sm:inline">Clair de Lune</span>
        </Link>

        <Suspense fallback={null}>
          <HeaderSearchVisibility>
            {/* Desktop search */}
            <div className="hidden flex-1 justify-center lg:flex">
              <SearchBar cities={filterOptions.cities} />
            </div>
            {/* Mobile search */}
            <div className="flex flex-1 lg:hidden">
              <SearchBarMobile cities={filterOptions.cities} />
            </div>
          </HeaderSearchVisibility>
        </Suspense>

        <UserMenu
          isAuthenticated={!!session}
          userName={session?.user.name ?? undefined}
          userRole={session?.user.role ?? undefined}
        />
      </div>
    </header>
  );
}
