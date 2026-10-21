import {
  getOwnerActiveTickets,
  getOwnerCashCollectedToday,
  getOwnerDayOrders,
  getOwnerSpecials,
} from "@/lib/actions/private-orders";
import { AnalyticsCard } from "@/components/admin/AnalyticsCard";
import { SpecialsList } from "@/components/admin/SpecialsList";
import { OsShell } from "@/components/os/OsShell";

export const dynamic = "force-dynamic";

export default async function OsDayPage() {
  const [specials, todaysOrders, todaysCollections, activeTickets] = await Promise.all([
    getOwnerSpecials(),
    getOwnerDayOrders(),
    getOwnerCashCollectedToday(),
    getOwnerActiveTickets(),
  ]);

  return (
    <OsShell title="Day" subtitle="Sales, order activity, and specials" active="day">
      <section>
          <AnalyticsCard
            initialOrders={todaysOrders}
            initialCashCollections={todaysCollections}
            initialActiveOrders={activeTickets}
          />
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Daily &amp; weekly specials</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Active specials appear on the storefront on their scheduled days, separately from today&apos;s dish board.
        </p>
        <div className="mt-3">
          <SpecialsList specials={specials} />
        </div>
      </section>
    </OsShell>
  );
}
