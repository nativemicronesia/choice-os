import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookieName, parseSessionToken } from "@/lib/auth/session";
import { previewOsEnabled } from "@/lib/auth/preview";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsOwner =
    pathname.startsWith("/os") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/kds");

  if (!needsOwner) return NextResponse.next();

  // Preview workspace: open, demonstration data only. /os/live (real data) stays gated.
  const isPreviewOs =
    (pathname === "/os" || pathname.startsWith("/os/")) &&
    pathname !== "/os/live" &&
    !pathname.startsWith("/os/live/");
  if (isPreviewOs && previewOsEnabled()) return NextResponse.next();

  const token = request.cookies.get(getSessionCookieName())?.value;
  try {
    if (parseSessionToken(token)) return NextResponse.next();
  } catch {
    // Missing SESSION_SECRET or bad token — treat as logged out
  }

  const login = new URL("/login", request.url);
  login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/os/:path*", "/admin/:path*", "/kds/:path*"],
};
