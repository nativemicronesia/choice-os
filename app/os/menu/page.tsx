import { getMenuItems } from "@/lib/supabase/queries";
import { OsShell } from "@/components/os/OsShell";
import { TodaysMenuManager } from "@/components/os/TodaysMenuManager";

export const dynamic = "force-dynamic";

export default async function OsMenuPage() {
  const items = await getMenuItems();

  return (
    <OsShell
      title="Today's menu"
      subtitle="What customers can order online for pickup"
      active="menu"
    >
      <TodaysMenuManager items={items} />
    </OsShell>
  );
}
