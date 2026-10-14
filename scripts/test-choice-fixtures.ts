import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import test from "node:test";
import {
  fixtureAdvanceOrder,
  fixtureMenu,
  fixtureOwnerActiveOrders,
  fixturePlaceOrder,
  fixtureSetMenuAvailability,
  fixtureTrackedOrder,
  isChoiceFixtureMode,
} from "@/lib/dev/choice-fixtures";

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

  fixtureSetMenuAvailability(dish.id, false);
  assert.throws(() => fixturePlaceOrder({
    name: "Unavailable Item",
    items: [{ item_id: dish.id, quantity: 1, special_instructions: null }],
    trackingTokenHash: createHash("sha256").update(randomBytes(32)).digest("hex"),
  }));
});
