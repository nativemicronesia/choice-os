import { getOwnerDayOrders, getOwnerSpecials } from "@/lib/actions/private-orders";
import { AnalyticsCard } from "@/components/admin/AnalyticsCard";
import { SpecialsList } from "@/components/admin/SpecialsList";
import { OsShell } from "@/components/os/OsShell";

export const dynamic = "force-dynamic";

export default async function OsDayPage() {
  const [specials, todaysOrders] = await Promise.all([
    getOwnerSpecials(),
    getOwnerDayOrders(),
  ]);

  return (
    <OsShell title="Day" subtitle="Today's numbers and specials banner" active="day">
      <section>
        <AnalyticsCard initialOrders={todaysOrders} />
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Daily specials</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Shown as a banner on the storefront. Separate from today&apos;s dish board.
        </p>
        <div className="mt-3">
          <SpecialsList specials={specials} />
        </div>
      </section>
    </OsShell>
  );
}
