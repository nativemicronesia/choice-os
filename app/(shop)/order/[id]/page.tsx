import { notFound } from "next/navigation";
import { getTrackedOrder } from "@/lib/supabase/private-orders";
import { OrderStatusTracker } from "@/components/order/OrderStatusTracker";

// See app/(shop)/page.tsx — no Supabase project exists yet, force on-request
// rendering so `next build` doesn't try (and fail) to prerender this.
export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tracked = await getTrackedOrder(id);
  if (!tracked) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <OrderStatusTracker initialOrder={tracked.order} realtimeTopic={tracked.realtimeTopic} />
    </main>
  );
}
