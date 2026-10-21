import type { Metadata } from "next";
import { OrderRequest } from "@/components/storefront/OrderRequest";

export const metadata: Metadata = { title: "Order" };

export default function OrderPage() {
  return (
    <div className="bg-sand-50">
      <section className="bg-ink-900 text-sand-50">
        <div className="mx-auto max-w-7xl px-5 pb-10 pt-12 sm:px-8 sm:pb-14 sm:pt-16">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-sunset-400">Order</p>
          <h1 className="sf-display mt-3 text-5xl font-extrabold leading-none sm:text-7xl">Ready when <span className="text-sunset-400">you are.</span></h1>
          <p className="mt-4 max-w-xl text-sand-300">Review what you picked and send a request. Sales preview: nothing here becomes a real order.</p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <OrderRequest />
      </div>
    </div>
  );
}
