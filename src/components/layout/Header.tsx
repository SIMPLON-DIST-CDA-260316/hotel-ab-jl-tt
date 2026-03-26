import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { SearchBar } from "@/features/search/components/SearchBar";
import { SearchBarMobile } from "@/features/search/components/SearchBarMobile";
import { UserMenu } from "@/components/layout/UserMenu";
import { HeaderSearchVisibility } from "@/components/layout/HeaderSearchVisibility";

export async function Header() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <header className="border-b px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link href="/" className="shrink-0 font-semibold">
          Hôtels Clair de Lune
        </Link>

        <Suspense fallback={null}>
          <HeaderSearchVisibility>
            {/* Desktop search */}
            <div className="hidden flex-1 justify-center lg:flex">
              <SearchBar />
            </div>
            {/* Mobile search */}
            <div className="flex flex-1 lg:hidden">
              <SearchBarMobile />
            </div>
          </HeaderSearchVisibility>
        </Suspense>

        <UserMenu
          isAuthenticated={!!session}
          userName={session?.user.name ?? undefined}
        />
      </div>
    </header>
  );
}
