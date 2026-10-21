import assert from "node:assert/strict";
import test from "node:test";
import { addSampleOrder, blankDish, ingestStorefront, menuFeed, nextStatus, orderTotal, removeDish, setOrderStatus, toggleDish, upsertDish } from "../lib/preview-os/logic";
import { seedState } from "../lib/preview-os/seed";
import { ORDER_STATUSES, type StorefrontRecord } from "../lib/preview-os/types";

const record = (reference: string): StorefrontRecord => ({
  reference, name: "Test Person", contact: "n/a", location: "stop-by", note: "hi",
  lines: [{ itemId: "burger", quantity: 2 }, { itemId: "gone", quantity: 1 }], submittedAt: "2026-10-21T01:00:00.000Z",
});

test("status flow runs New -> Completed in order and stops", () => {
  let s = seedState();
  const id = s.orders.find((o) => o.status === "new")!.id;
  const seen = ["new"];
  for (let n = nextStatus("new"); n; n = nextStatus(n)) {
    s = setOrderStatus(s, id, n);
    seen.push(s.orders.find((o) => o.id === id)!.status);
  }
  assert.deepEqual(seen, [...ORDER_STATUSES]);
  assert.equal(nextStatus("completed"), null);
});

test("stepping back trims history", () => {
  let s = seedState();
  const id = "sample-3"; // preparing
  s = setOrderStatus(s, id, "accepted");
  const o = s.orders.find((x) => x.id === id)!;
  assert.deepEqual(o.history.map((h) => h.status), ["new", "accepted"]);
});

test("storefront orders import once, as New, with names resolved", () => {
  let s = ingestStorefront(seedState(), [record("DEMO-1")]);
  s = ingestStorefront(s, [record("DEMO-1"), record("DEMO-2")]);
  const sf = s.orders.filter((o) => o.source === "storefront");
  assert.equal(sf.length, 2);
  assert.equal(sf[0].status, "new");
  assert.equal(sf[0].lines[0].name, "Burger");
  assert.equal(sf[0].lines[1].name, "Item no longer on the menu");
  assert.equal(ingestStorefront(s, [record("DEMO-2")]), s);
});

test("totals are never invented from missing prices", () => {
  const s = seedState();
  assert.equal(orderTotal(s.orders[0]), null);
  const priced = { ...s.orders[0], lines: [{ itemId: "a", name: "A", quantity: 2, price: 3.5 }] };
  assert.equal(orderTotal(priced), 7);
});

test("menu add / edit / toggle / remove and public feed", () => {
  let s = seedState();
  const d = { ...blankDish("featured"), name: "Test Dish", price: 5 };
  s = upsertDish(s, d);
  s = upsertDish(s, { ...d, name: "Renamed" });
  assert.equal(s.dishes.filter((x) => x.id === d.id).length, 1);
  s = toggleDish(s, d.id);
  const feed = menuFeed(s).find((x) => x.id === d.id)!;
  assert.deepEqual([feed.name, feed.available, feed.group], ["Renamed", false, "featured"]);
  s = removeDish(s, d.id);
  assert.ok(!s.dishes.some((x) => x.id === d.id));
});

test("sample orders use only available dishes", () => {
  let s = seedState();
  s = { ...s, dishes: s.dishes.map((d) => ({ ...d, available: d.id === "tacos" })) };
  const out = addSampleOrder(s);
  assert.deepEqual(out.orders[0].lines.map((l) => l.itemId), ["tacos"]);
  const none = { ...s, dishes: s.dishes.map((d) => ({ ...d, available: false })) };
  assert.equal(addSampleOrder(none), none);
});
