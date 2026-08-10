import { NextResponse } from "next/server";
import { clearSessionCookieHeader } from "@/lib/auth/session";

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/login", req.url), 303);
  res.headers.set("Set-Cookie", clearSessionCookieHeader());
  return res;
}
