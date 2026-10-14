import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import test from "node:test";
import {
  fixtureAdvanceOrder,
  fixtureMenu,
  fixtureOwnerActiveOrders,
  fixtureOwnerCashCollected,
  fixtureOwnerOrders,
  fixturePlaceOrder,
  fixtureSetMenuAvailability,
  fixtureUpsertMenu,
  fixtureUpsertSpecial,
  fixtureTrackedOrder,
  fixtureSpecials,
  isChoiceFixtureMode,
} from "@/lib/dev/choice-fixtures";
import { isSpecialScheduledForWeekday } from "@/lib/specials/schedule";
import { POST as placeOrder } from "@/app/api/orders/route";
import { chuukTodayRangeUtc } from "@/lib/time/chuukToday";

test("fixtures support concurrent owner, kitchen, and customer pickup workflows", async () => {
  assert.equal(isChoiceFixtureMode(), true);
  const menu = fixtureMenu(true);
  const dish = menu.find((entry) => entry.name === "Choice Classic Burger");
  assert.ok(dish);

  const dailySpecial = fixtureSpecials(true).find((special) => special.frequency === "daily");
  assert.ok(dailySpecial);
  const secondDish = menu.find((entry) => entry.name === "Crispy Chicken Sandwich");
  assert.ok(secondDish);
  const thirdDish = menu.find((entry) => entry.name === "Double Cheeseburger");
  assert.ok(thirdDish);
  const [checkout, secondCheckout, thirdCheckout] = await Promise.all([
    placeOrder(new Request("http://localhost:3003/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Fixture Customer",
        items: [
          { itemId: dish.id, itemType: "menu", quantity: 2, specialInstructions: "No onions", unitPrice: 0.01 },
          { itemId: dailySpecial.id, itemType: "special", quantity: 1, specialInstructions: "Sauce on side", unitPrice: 0.01 },
        ],
      }),
    })),
    placeOrder(new Request("http://localhost:3003/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Second Fixture Customer",
        items: [{ itemId: secondDish.id, itemType: "menu", quantity: 1, specialInstructions: "Extra crispy" }],
      }),
    })),
    placeOrder(new Request("http://localhost:3003/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Third Fixture Customer",
        items: [{ itemId: thirdDish.id, itemType: "menu", quantity: 1, specialInstructions: null }],
      }),
    })),
  ]);
  const [checkoutBody, secondCheckoutBody, thirdCheckoutBody] = await Promise.all([
    checkout.json() as Promise<{ orderId: string }>,
    secondCheckout.json() as Promise<{ orderId: string }>,
    thirdCheckout.json() as Promise<{ orderId: string }>,
  ]);
  assert.equal(checkout.status, 201);
  assert.equal(secondCheckout.status, 201);
  assert.equal(thirdCheckout.status, 201);
  const orderId = checkoutBody.orderId;
  const secondOrderId = secondCheckoutBody.orderId;
  const thirdOrderId = thirdCheckoutBody.orderId;
  const trackingToken = checkout.headers.get("set-cookie")?.match(/choice_order_access=([^;]+)/)?.[1];
  const secondTrackingToken = secondCheckout.headers.get("set-cookie")?.match(/choice_order_access=([^;]+)/)?.[1];
  const thirdTrackingToken = thirdCheckout.headers.get("set-cookie")?.match(/choice_order_access=([^;]+)/)?.[1];
  assert.ok(trackingToken);
  assert.ok(secondTrackingToken);
  assert.ok(thirdTrackingToken);
  const tracked = fixtureTrackedOrder(orderId, trackingToken);
  assert.ok(tracked);
  assert.equal(tracked.total, 15.5);
  assert.equal(tracked.order_items[0]?.price_at_time, dish.price);
  assert.equal(tracked.order_items[0]?.quantity, 2);
  assert.equal(tracked.order_items[0]?.special_instructions, "No onions");
  assert.equal(tracked.order_items[1]?.item_name, dailySpecial.title);
  assert.equal(tracked.order_items[1]?.price_at_time, dailySpecial.price);
  assert.equal(tracked.order_items[1]?.special_instructions, "Sauce on side");
  assert.equal("trackingTokenHash" in tracked, false);
  assert.equal(fixtureTrackedOrder(orderId, "wrong-capability"), null);
  const secondTracked = fixtureTrackedOrder(secondOrderId, secondTrackingToken);
  assert.ok(secondTracked);
  assert.equal(secondTracked.total, secondDish.price);
  assert.equal(secondTracked.order_items[0]?.special_instructions, "Extra crispy");
  assert.equal(fixtureTrackedOrder(thirdOrderId, thirdTrackingToken)?.status, "pending");

  const tickets = fixtureOwnerActiveOrders();
  assert.equal(tickets.some((ticket) => ticket.id === orderId), true);
  assert.equal(tickets.some((ticket) => ticket.id === secondOrderId), true);
  assert.equal(tickets.some((ticket) => ticket.id === thirdOrderId), true);
  assert.equal(tickets.filter((ticket) => ticket.status === "pending").length, 3);
  const ownerDetails = fixtureOwnerOrders().find((ticket) => ticket.id === orderId);
  assert.equal(ownerDetails?.order_items[0]?.quantity, 2);
  assert.equal(ownerDetails?.order_items[0]?.special_instructions, "No onions");
  assert.equal(typeof ownerDetails?.created_at, "string");
  assert.equal(fixtureAdvanceOrder(orderId, "pending", "ready"), false);
  assert.equal(fixtureAdvanceOrder(orderId, "pending", "cooking"), true);
  assert.equal(fixtureAdvanceOrder(orderId, "cooking", "ready"), true);
  assert.equal(fixtureTrackedOrder(orderId, trackingToken)?.status, "ready");
  assert.equal(fixtureAdvanceOrder(secondOrderId, "pending", "cancelled"), true);
  assert.equal(fixtureAdvanceOrder(thirdOrderId, "pending", "cooking"), true);
  assert.equal(fixtureTrackedOrder(secondOrderId, secondTrackingToken)?.status, "cancelled");
  assert.equal(fixtureTrackedOrder(secondOrderId, secondTrackingToken)?.cash_collected_at, null);
  assert.equal(fixtureTrackedOrder(thirdOrderId, thirdTrackingToken)?.status, "cooking");
  assert.equal(fixtureOwnerActiveOrders().some((ticket) => ticket.id === orderId), true);
  assert.equal(fixtureOwnerActiveOrders().some((ticket) => ticket.id === secondOrderId), false);
  assert.equal(fixtureOwnerActiveOrders().some((ticket) => ticket.id === thirdOrderId), true);
  const activeCountBeforeUnavailableAttempt = fixtureOwnerActiveOrders().length;
  fixtureSetMenuAvailability(dish.id, false);
  assert.throws(() => fixturePlaceOrder({
    name: "Unavailable Item",
    items: [{ item_id: dish.id, item_type: "menu", quantity: 1, special_instructions: null }],
    trackingTokenHash: createHash("sha256").update(randomBytes(32)).digest("hex"),
  }));
  assert.equal(fixtureOwnerActiveOrders().length, activeCountBeforeUnavailableAttempt);
  assert.equal(fixtureOwnerActiveOrders().some((ticket) => ticket.id === orderId), true);
  assert.equal(fixtureAdvanceOrder(orderId, "ready", "completed"), true);
  const collectedAt = fixtureTrackedOrder(orderId, trackingToken)?.cash_collected_at;
  assert.ok(collectedAt);
  assert.equal(fixtureAdvanceOrder(orderId, "completed", "completed"), false);
  assert.equal(fixtureAdvanceOrder(orderId, "completed", "cancelled"), false);
  assert.equal(fixtureTrackedOrder(orderId, trackingToken)?.cash_collected_at, collectedAt);
  assert.equal(fixtureAdvanceOrder(secondOrderId, "cancelled", "completed"), false);
  assert.equal(fixtureOwnerActiveOrders().some((ticket) => ticket.id === orderId), false);
  assert.equal(fixtureOwnerActiveOrders().some((ticket) => ticket.id === thirdOrderId), true);
  const dayOrders = fixtureOwnerOrders();
  assert.equal(dayOrders.length, 3);
  assert.equal(dayOrders.filter((order) => order.status === "completed").length, 1);
  assert.equal(dayOrders.filter((order) => order.status === "cancelled").length, 1);
  assert.equal(dayOrders.filter((order) => ["pending", "cooking", "ready"].includes(order.status)).length, 1);
  assert.equal(
    dayOrders.filter((order) => order.cash_collected_at !== null).reduce((sum, order) => sum + order.total, 0),
    15.5,
  );
  assert.equal(fixtureTrackedOrder(orderId, trackingToken)?.status, "completed");

  const { startUtc, endUtc } = chuukTodayRangeUtc();
  const yesterday = new Date(startUtc.getTime() - 60_000);
  const collectedToday = new Date(startUtc.getTime() + 60_000);
  const overnightOrderId = fixturePlaceOrder({
    name: "Overnight Pickup",
    items: [{ item_id: thirdDish.id, item_type: "menu", quantity: 1, special_instructions: null }],
    trackingTokenHash: createHash("sha256").update(randomBytes(32)).digest("hex"),
    now: yesterday,
  });
  assert.equal(fixtureAdvanceOrder(overnightOrderId, "pending", "cooking", collectedToday), true);
  assert.equal(fixtureAdvanceOrder(overnightOrderId, "cooking", "ready", collectedToday), true);
  assert.equal(fixtureAdvanceOrder(overnightOrderId, "ready", "completed", collectedToday), true);
  assert.equal(fixtureOwnerOrders(startUtc.toISOString(), endUtc.toISOString()).some((order) => order.id === overnightOrderId), false);
  const collectionsToday = fixtureOwnerCashCollected(startUtc.toISOString(), endUtc.toISOString());
  assert.equal(collectionsToday.some((collection) => collection.id === overnightOrderId), true);
  assert.equal(collectionsToday.reduce((sum, collection) => sum + collection.total, 0), 15.5 + thirdDish.price);

  const daily = fixtureSpecials(true).find((special) => special.frequency === "daily");
  const friday = fixtureSpecials(true).find((special) => special.frequency === "weekly");
  assert.ok(daily && friday);
  assert.equal(isSpecialScheduledForWeekday(daily, 0), true);
  assert.equal(isSpecialScheduledForWeekday(friday, 5), true);
  assert.equal(isSpecialScheduledForWeekday(friday, 4), false);
  assert.throws(() => fixturePlaceOrder({
    name: "Expired Special",
    items: [{ item_id: friday.id, item_type: "special", quantity: 1, special_instructions: null }],
    trackingTokenHash: createHash("sha256").update(randomBytes(32)).digest("hex"),
    now: new Date("2026-10-15T00:00:00.000Z"), // Thursday in Chuuk
  }));

  const newDish = fixtureUpsertMenu({
    id: "60000000-0000-4000-8000-000000000001",
    name: "Test platter",
    category: "Local Specials",
    description: null,
    price: 12,
    image_url: null,
    is_available: false,
  });
  assert.equal(fixtureMenu(true).some((entry) => entry.id === newDish.id), false);
  fixtureUpsertMenu({ ...newDish, price: 13, is_available: true });
  assert.equal(fixtureMenu(true).find((entry) => entry.id === newDish.id)?.price, 13);

  const weekly = fixtureUpsertSpecial({
    id: "70000000-0000-4000-8000-000000000001",
    title: "Saturday combo",
    description: null,
    price: 11,
    active: true,
    frequency: "weekly",
    weekdays: [6],
    image_url: null,
  });
  assert.equal(isSpecialScheduledForWeekday(weekly, 6), true);
  assert.equal(isSpecialScheduledForWeekday(weekly, 5), false);

});
