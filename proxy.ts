import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookieName, parseSessionToken } from "@/lib/auth/session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsOwner =
    pathname.startsWith("/os") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/kds");

  if (!needsOwner) return NextResponse.next();

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
