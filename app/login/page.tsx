import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getOwnerSession } from "@/lib/auth/require";
import { DataModeNotice } from "@/components/shared/DataModeNotice";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getOwnerSession();
  if (session) redirect("/os/menu");

  return (
    <>
      <DataModeNotice />
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Choice OS</p>
        <h1 className="mt-1 text-2xl font-bold">Owner sign in</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage today&apos;s menu, kitchen, and day ops.
        </p>
        <Suspense fallback={<p className="mt-6 text-sm text-neutral-500">Loading…</p>}>
          <LoginForm />
        </Suspense>
        <p className="mt-8 text-center text-sm">
          <Link href="/" className="text-neutral-600 underline">
            ← Back to storefront
          </Link>
        </p>
      </main>
    </>
  );
}
