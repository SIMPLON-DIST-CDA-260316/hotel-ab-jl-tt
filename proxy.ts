import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { ROLES } from "@/config/roles";

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname, searchParams } = request.nextUrl;

  const session = await auth.api.getSession({ headers: request.headers });

  const isAuthenticated = session !== null;
  const role = session?.user.role as string | undefined;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && (pathname === "/inscription" || pathname === "/connexion")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/reservations")) {
    if (!isAuthenticated) {
      const callbackUrl = encodeURIComponent(pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ""));
      return NextResponse.redirect(new URL(`/connexion?callbackUrl=${callbackUrl}`, request.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated || role !== ROLES.ADMIN) {
      return NextResponse.redirect(new URL("/connexion", request.url));
    }
  }

  if (pathname.startsWith("/gerant")) {
    if (!isAuthenticated || role !== ROLES.MANAGER) {
      return NextResponse.redirect(new URL("/connexion", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
