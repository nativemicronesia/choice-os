import { requireOwnerSession } from "@/lib/auth/require";

export const dynamic = "force-dynamic";

export default async function OsLayout({ children }: { children: React.ReactNode }) {
  await requireOwnerSession();
  return children;
}
