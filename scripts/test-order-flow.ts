// Phase 3 verification script: simulates a full order lifecycle against a
// live Supabase project — place an order (as the anon checkout path would),
// verify the row persisted, verify Realtime emits both the INSERT and each
// status-change UPDATE, drive the ticket through the real production
// updateOrderStatus Server Action (not a reimplementation of it), then
// clean up the test row. Requires a live, migrated Supabase project — see
// .env.local. Run: npm run test:order-flow
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { randomUUID } from "node:crypto";
import { createClient, type RealtimeChannel } from "@supabase/supabase-js";
import { updateOrderStatus } from "../lib/actions/orders";
import { ALLOWED_TRANSITIONS } from "../lib/orders/transitions";
import type { OrderStatus } from "../lib/types/database";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / " +
      "SUPABASE_SERVICE_ROLE_KEY). Copy .env.example to .env.local, fill in a real (migrated) " +
      "Supabase project, and try again.",
  );
  process.exit(1);
}

// Anon client: used for every write the real checkout flow is allowed to
// make under RLS (order + order_items insert), so this test exercises the
// actual authorization boundary, not a privileged shortcut.
const anon = createClient(SUPABASE_URL, ANON_KEY);
// Admin client: only for teardown (anon has no DELETE policy on either
// table, by design — see supabase/migrations).
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type CapturedEvent = { eventType: "INSERT" | "UPDATE" | "DELETE"; new: Record<string, unknown> };

function waitForEvent(
  events: CapturedEvent[],
  predicate: (event: CapturedEvent) => boolean,
  timeoutMs = 8000,
): Promise<CapturedEvent> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const poll = () => {
      const index = events.findIndex(predicate);
      if (index !== -1) {
        resolve(events.splice(index, 1)[0]);
        return;
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Timed out after ${timeoutMs}ms waiting for a matching realtime event`));
        return;
      }
      setTimeout(poll, 100);
    };
    poll();
  });
}

function subscribeToOrder(orderId: string): Promise<{ channel: RealtimeChannel; events: CapturedEvent[] }> {
  const events: CapturedEvent[] = [];
  const channel = admin.channel(`test-order-flow-${orderId}`).on(
    "postgres_changes",
    { event: "*", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
    (payload) => {
      events.push({ eventType: payload.eventType as CapturedEvent["eventType"], new: payload.new });
    },
  );

  return new Promise((resolve, reject) => {
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") resolve({ channel, events });
      else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        reject(new Error(`Realtime subscription failed: ${status}`));
      }
    });
  });
}

function step(label: string) {
  console.log(`\n${label}`);
}

function ok(label: string) {
  console.log(`  ✓ ${label}`);
}

async function main() {
  const testOrderId = randomUUID();
  let channel: RealtimeChannel | undefined;

  try {
    step("1. Subscribing to Realtime for the test order (before it exists, like /order/[id] does)");
    const subscription = await subscribeToOrder(testOrderId);
    channel = subscription.channel;
    const events = subscription.events;
    ok("subscribed");

    step("2. Placing the order via the anon client (same path as real checkout)");
    const { data: order, error: orderError } = await anon
      .from("orders")
      .insert({ id: testOrderId, customer_name: "Test Order Flow", status: "pending", total: 9.99 })
      .select()
      .single();
    if (orderError || !order) throw new Error(`order insert failed: ${orderError?.message}`);
    ok(`order ${testOrderId} inserted`);

    const { error: itemsError } = await anon.from("order_items").insert([
      {
        order_id: testOrderId,
        item_name: "Test Item",
        quantity: 2,
        price_at_time: 4.995,
        special_instructions: "no onions",
      },
    ]);
    if (itemsError) throw new Error(`order_items insert failed: ${itemsError.message}`);
    ok("order_items inserted");

    step("3. Verifying Realtime emitted the INSERT event");
    await waitForEvent(events, (e) => e.eventType === "INSERT" && e.new.status === "pending");
    ok("INSERT event received with status=pending");

    step("4. Verifying the row via a fresh read (same query shape as getOrderWithItems)");
    const { data: fetched, error: fetchError } = await anon
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", testOrderId)
      .single();
    if (fetchError || !fetched) throw new Error(`fetch failed: ${fetchError?.message}`);
    if (fetched.status !== "pending") throw new Error(`expected status=pending, got ${fetched.status}`);
    if (fetched.order_items.length !== 1) throw new Error(`expected 1 order_item, got ${fetched.order_items.length}`);
    ok("order + order_items persisted correctly");

    step("5. Driving the ticket through every status transition via the real updateOrderStatus action");
    let current: OrderStatus = "pending";
    while (ALLOWED_TRANSITIONS[current]) {
      const next: OrderStatus = ALLOWED_TRANSITIONS[current]!;
      const result = await updateOrderStatus(testOrderId, current, next);
      if (!result.success) throw new Error(`updateOrderStatus(${current} -> ${next}) failed: ${result.error}`);
      await waitForEvent(events, (e) => e.eventType === "UPDATE" && e.new.status === next);
      ok(`${current} -> ${next} (Server Action + Realtime UPDATE both confirmed)`);
      current = next;
    }

    step("6. Confirming an illegal transition is rejected (completed has no next status)");
    const illegal = await updateOrderStatus(testOrderId, "completed", "pending");
    if (illegal.success) throw new Error("expected illegal transition to fail, but it succeeded");
    ok(`rejected as expected: ${illegal.error}`);

    console.log("\nAll checks passed.");
  } finally {
    step("Cleaning up test data");
    await admin.from("order_items").delete().eq("order_id", testOrderId);
    await admin.from("orders").delete().eq("id", testOrderId);
    if (channel) await admin.removeChannel(channel);
    ok("test order removed");
  }
}

main().catch((error) => {
  console.error("\n✗ test-order-flow failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
