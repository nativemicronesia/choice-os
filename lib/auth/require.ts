import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionCookieName, parseSessionToken, type SessionPayload } from "./session";

export async function getOwnerSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  return parseSessionToken(jar.get(getSessionCookieName())?.value);
}

export async function requireOwnerSession(): Promise<SessionPayload> {
  const session = await getOwnerSession();
  if (!session) redirect("/login");
  return session;
}
