// Interface between the public storefront preview and Choice OS demo orders.
//
// The storefront only ever calls submitPreviewOrder(); the OS side (owned by
// another terminal) may read listPreviewOrders() when it wants to show these.
// Records live in process memory, are labeled demo, and are never written to a
// database, payment provider or messaging service. See
// docs/STOREFRONT-OS-CONTRACT.md.

export type PreviewOrderRequest = {
  name: string;
  contact: string;
  /** Provisional preference only; no operational policy is implied. */
  location: "dine-in" | "stop-by" | "undecided";
  note: string;
  lines: { itemId: string; quantity: number }[];
};

export type PreviewOrderRecord = PreviewOrderRequest & {
  reference: string;
  demo: true;
  source: "storefront-preview";
  submittedAt: string;
};

declare global {
  // Typed loosely so the OS-side reader (app/api/os-preview/storefront-orders) can declare the same global.
  var __choicePreviewOrders: unknown[] | undefined;
}

const store = () => (globalThis.__choicePreviewOrders ??= []) as PreviewOrderRecord[];

export function submitPreviewOrder(request: PreviewOrderRequest): PreviewOrderRecord {
  const reference = `DEMO-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const record: PreviewOrderRecord = {
    ...request,
    reference,
    demo: true,
    source: "storefront-preview",
    submittedAt: new Date().toISOString(),
  };
  const orders = store();
  orders.push(record);
  if (orders.length > 100) orders.shift();
  return record;
}

export function listPreviewOrders(): PreviewOrderRecord[] {
  return store().map((order) => structuredClone(order));
}
