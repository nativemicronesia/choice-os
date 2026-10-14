// Local-only smoke test for the public pickup journey and its access boundary.
// Refuses every non-loopback Supabase URL and deletes its test order on exit.
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import type { OrderStatus } from "../lib/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3003";
const statuses: OrderStatus[] = ["pending", "cooking", "ready", "completed"];

if (!supabaseUrl || !anonKey || !serviceKey) {
  throw new Error("Set the local Supabase URL, anon key, and service role key in .env.local.");
}
const database = new URL(supabaseUrl);
if (!new Set(["127.0.0.1", "localhost", "::1"]).has(database.hostname) || database.port !== "54321") {
  throw new Error("Refusing to run: order-flow tests are restricted to the configured local Supabase API on port 54321.");
}

const anon = createClient(supabaseUrl, anonKey);
const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  let orderId: string | null = null;
  try {
    const menu = await anon.from("menu_items").select("id,name,price").eq("is_available", true).limit(1).single();
    check(!menu.error && menu.data, `Public menu query failed: ${menu.error?.message}`);
    console.log("✓ Public menu is readable");

    const storefront = await fetch(siteUrl);
    const page = await storefront.text();
    check(storefront.ok && page.includes(menu.data.name), "Storefront did not render the available menu item");
    console.log("✓ Storefront renders the development menu");

    const forgedClientPrice = 0.01;
    const place = await fetch(`${siteUrl}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Local Test Order",
        items: [{ menuItemId: menu.data.id, quantity: 2, unitPrice: forgedClientPrice }],
      }),
    });
    const placed = (await place.json()) as { orderId?: string; error?: string };
    check(place.status === 201 && placed.orderId, `Checkout failed: ${placed.error ?? place.status}`);
    orderId = placed.orderId;
    const setCookie = place.headers.get("set-cookie");
    check(setCookie, "Checkout did not issue a tracking cookie");
    const trackingCookie = setCookie.split(";")[0];
    check(trackingCookie.startsWith("choice_order_access="), "Checkout issued an unexpected tracking cookie");
    console.log("✓ Cash pickup checkout creates an order through the server");

    const stored = await admin.from("orders").select("id,status,total,customer_name").eq("id", orderId).single();
    const storedItems = await admin.from("order_items").select("item_name,quantity,price_at_time").eq("order_id", orderId);
    check(!stored.error && stored.data, "Order row was not created");
    check(!storedItems.error && storedItems.data?.length === 1, "Order and items were not created atomically");
    check(Number(stored.data.total) === Number(menu.data.price) * 2, "Server did not calculate the order total from menu prices");
    check(Number(storedItems.data[0].price_at_time) === Number(menu.data.price), "Server trusted a forged client price");
    console.log("✓ Order and items are atomic; stored prices and total come from the database menu");

    for (const table of ["orders", "order_items"] as const) {
      const privateRead = await anon.from(table).select("*").eq(table === "orders" ? "id" : "order_id", orderId);
      check(privateRead.error || privateRead.data?.length === 0, `Anonymous key can read private ${table}`);
    }
    const anonymousInsert = await anon.from("orders").insert({ customer_name: "Should Be Denied", status: "pending", total: 0 });
    check(anonymousInsert.error, "Anonymous key can bypass the server-side checkout RPC");
    console.log("✓ Public key cannot read private orders or create raw order rows");

    const tracking = await fetch(`${siteUrl}/order/${orderId}`, { headers: { Cookie: trackingCookie } });
    const trackingHtml = await tracking.text();
    check(tracking.ok && trackingHtml.includes("Local Test Order"), "Scoped tracking cookie could not read its own order");
    const stranger = await fetch(`${siteUrl}/order/${orderId}`);
    check(stranger.status === 404, "Order tracking exposed a private order without its capability cookie");
    console.log("✓ Tracking cookie grants access only to its own order");

    for (const status of statuses.slice(1)) {
      const { error } = await admin.from("orders").update({ status }).eq("id", orderId);
      check(!error, `Unable to simulate owner status ${status}: ${error?.message}`);
      const updated = await fetch(`${siteUrl}/order/${orderId}`, { headers: { Cookie: trackingCookie } });
      check(updated.ok, `Tracking page failed after status ${status}`);
    }
    console.log("✓ Order status transitions remain visible to its tracking capability");

    const ownerPage = await fetch(`${siteUrl}/kds`, { redirect: "manual" });
    check(ownerPage.status >= 300 && ownerPage.status < 400, "Kitchen display is not protected by owner authentication");
    console.log("✓ Kitchen display remains behind owner authentication");

    const testEmail = process.env.CHOICE_LOCAL_TEST_EMAIL;
    const testPassword = process.env.CHOICE_LOCAL_TEST_PASSWORD;
    if (testEmail && testPassword) {
      const login = await fetch(`${siteUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail, password: testPassword }),
      });
      const loginCookie = login.headers.get("set-cookie");
      check(login.ok && loginCookie?.startsWith("choice_owner_session="), "Local owner credentials were rejected");
      check(loginCookie, "Owner login did not return a session cookie");
      const ownerCookie = loginCookie.split(";")[0];
      const menuOs = await fetch(`${siteUrl}/os/menu`, { headers: { Cookie: ownerCookie } });
      const kitchen = await fetch(`${siteUrl}/kds`, { headers: { Cookie: ownerCookie } });
      check(menuOs.ok && kitchen.ok, "Owner session could not open the menu manager and kitchen display");
      console.log("✓ Local owner login opens the menu manager and kitchen display");
    }
  } finally {
    if (orderId) {
      await admin.from("order_items").delete().eq("order_id", orderId);
      await admin.from("orders").delete().eq("id", orderId);
    }
  }
}

main().catch((error) => {
  console.error("✗ Local order-flow verification failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
