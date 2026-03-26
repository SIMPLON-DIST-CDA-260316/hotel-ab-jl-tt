"use client";

import { usePathname } from "next/navigation";

const HIDDEN_SEARCH_PATTERNS = ["/admin", "/manager", "/sign-in", "/sign-up"];

interface HeaderSearchVisibilityProps {
  children: React.ReactNode;
}

export function HeaderSearchVisibility({ children }: HeaderSearchVisibilityProps): React.JSX.Element | null {
  const pathname = usePathname();

  const shouldHide =
    pathname === "/" ||
    HIDDEN_SEARCH_PATTERNS.some((pattern) => pathname.startsWith(pattern));

  if (shouldHide) return null;

  return <>{children}</>;
}
