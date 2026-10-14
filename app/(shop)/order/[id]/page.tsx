import { notFound } from "next/navigation";
import Link from "next/link";
import { getTrackedOrder } from "@/lib/supabase/private-orders";
import { OrderStatusTracker } from "@/components/order/OrderStatusTracker";
import { DataModeNotice } from "@/components/shared/DataModeNotice";
import { ShopHeader } from "@/components/shop/ShopHeader";

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
      <ShopHeader skipHref="#order-progress-title" skipLabel="Skip to order status" />
      <main className="min-h-[calc(100dvh-68px)] bg-sand-50 px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-semibold text-ocean-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2">
            <span aria-hidden="true">←</span> Back to menu
          </Link>
          <div className="mt-6 max-w-2xl">
            <p className="text-sm font-semibold text-sunset-700">Thanks for ordering with Choice</p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">Your pickup order</h1>
            <p className="mt-2 text-sm leading-6 text-ink-500 sm:text-base">Follow the kitchen updates here. Pay cash when you collect your order in Weno.</p>
          </div>
          <div className="mt-7 rounded-2xl border border-sand-200 bg-white p-5 shadow-sm sm:p-8">
            <OrderStatusTracker initialOrder={tracked.order} realtimeTopic={tracked.realtimeTopic} />
          </div>
        </div>
      </main>
    </>
  );
}
