import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import test from "node:test";
import {
  fixtureAdvanceOrder,
  fixtureMenu,
  fixtureOwnerActiveOrders,
  fixturePlaceOrder,
  fixtureSetMenuAvailability,
  fixtureUpsertMenu,
  fixtureUpsertSpecial,
  fixtureTrackedOrder,
  fixtureSpecials,
  isChoiceFixtureMode,
} from "@/lib/dev/choice-fixtures";
import { isSpecialScheduledForWeekday } from "@/lib/specials/schedule";

test("fixtures support a private, server-priced pickup order through kitchen pickup", () => {
  assert.equal(isChoiceFixtureMode(), true);
  const menu = fixtureMenu(true);
  const dish = menu.find((entry) => entry.name === "Choice Classic Burger");
  assert.ok(dish);

  const trackingToken = randomBytes(32).toString("base64url");
  const orderId = fixturePlaceOrder({
    name: "Fixture Customer",
    items: [{ item_id: dish.id, quantity: 2, special_instructions: "No onions" }],
    trackingTokenHash: createHash("sha256").update(trackingToken).digest("hex"),
  });
  const tracked = fixtureTrackedOrder(orderId, trackingToken);
  assert.ok(tracked);
  assert.equal(tracked.total, 9);
  assert.equal(tracked.order_items[0]?.price_at_time, dish.price);
  assert.equal(tracked.order_items[0]?.quantity, 2);
  assert.equal(tracked.order_items[0]?.special_instructions, "No onions");
  assert.equal("trackingTokenHash" in tracked, false);
  assert.equal(fixtureTrackedOrder(orderId, "wrong-capability"), null);

  const tickets = fixtureOwnerActiveOrders();
  assert.equal(tickets.some((ticket) => ticket.id === orderId), true);
  assert.equal(fixtureAdvanceOrder(orderId, "pending", "ready"), false);
  assert.equal(fixtureAdvanceOrder(orderId, "pending", "cooking"), true);
  assert.equal(fixtureAdvanceOrder(orderId, "cooking", "ready"), true);
  assert.equal(fixtureAdvanceOrder(orderId, "ready", "completed"), true);
  assert.equal(fixtureOwnerActiveOrders().some((ticket) => ticket.id === orderId), false);
  assert.equal(fixtureTrackedOrder(orderId, trackingToken)?.status, "completed");

  const daily = fixtureSpecials(true).find((special) => special.frequency === "daily");
  const friday = fixtureSpecials(true).find((special) => special.frequency === "weekly");
  assert.ok(daily && friday);
  assert.equal(isSpecialScheduledForWeekday(daily, 0), true);
  assert.equal(isSpecialScheduledForWeekday(friday, 5), true);
  assert.equal(isSpecialScheduledForWeekday(friday, 4), false);

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

  const activeCountBeforeUnavailableAttempt = fixtureOwnerActiveOrders().length;
  fixtureSetMenuAvailability(dish.id, false);
  assert.throws(() => fixturePlaceOrder({
    name: "Unavailable Item",
    items: [{ item_id: dish.id, quantity: 1, special_instructions: null }],
    trackingTokenHash: createHash("sha256").update(randomBytes(32)).digest("hex"),
  }));
  assert.equal(fixtureOwnerActiveOrders().length, activeCountBeforeUnavailableAttempt);
});
