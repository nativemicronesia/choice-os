import { NextResponse } from "next/server";
import {
  checkOwnerCredentials,
  createSessionToken,
  sessionCookieHeader,
} from "@/lib/auth/session";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = (await req.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  try {
    if (!checkOwnerCredentials(email, password)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    const token = createSessionToken(email.trim().toLowerCase());
    const res = NextResponse.json({ ok: true });
    res.headers.set("Set-Cookie", sessionCookieHeader(token));
    return res;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed" },
      { status: 500 },
    );
  }
}
