import { notFound } from "next/navigation";
import Link from "next/link";
import { getTrackedOrder } from "@/lib/supabase/private-orders";
import { OrderStatusTracker } from "@/components/order/OrderStatusTracker";
import { DataModeNotice } from "@/components/shared/DataModeNotice";

// See app/(shop)/page.tsx — no Supabase project exists yet, force on-request
// rendering so `next build` doesn't try (and fail) to prerender this.
export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tracked = await getTrackedOrder(id);
  if (!tracked) notFound();

  return (
    <>
      <DataModeNotice />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-6">
        <Link href="/" className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-ocean-800 underline underline-offset-4">
          Back to menu
        </Link>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink-900">Pickup order status</h1>
        <p className="mt-1 text-sm text-ink-500">Your order updates automatically as the kitchen prepares it.</p>
        <OrderStatusTracker initialOrder={tracked.order} realtimeTopic={tracked.realtimeTopic} />
      </main>
    </>
  );
}
