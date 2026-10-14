import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fixturePlaceOrder, isChoiceFixtureMode } from "@/lib/dev/choice-fixtures";

type CheckoutLine = { itemId?: unknown; itemType?: unknown; quantity?: unknown; specialInstructions?: unknown };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid order request" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid order request" }, { status: 400 });
  }
  const checkout = body as { name?: unknown; items?: unknown };

  const name = typeof checkout.name === "string" ? checkout.name.trim() : "";
  if (!name || name.length > 80 || !Array.isArray(checkout.items) || checkout.items.length < 1 || checkout.items.length > 30) {
    return NextResponse.json({ error: "Check your name and order items" }, { status: 400 });
  }

  const items: { item_id: string; item_type: "menu" | "special"; quantity: number; special_instructions: string | null }[] = [];
  for (const candidate of checkout.items) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      return NextResponse.json({ error: "One or more order items are invalid" }, { status: 400 });
    }
    const line = candidate as CheckoutLine;
    const instructions = typeof line.specialInstructions === "string" ? line.specialInstructions.trim() : "";
    const itemType = line.itemType === "special" ? "special" : line.itemType === "menu" ? "menu" : null;
    if (
      !itemType || typeof line.itemId !== "string" || !UUID.test(line.itemId) ||
      !Number.isInteger(line.quantity) || Number(line.quantity) < 1 || Number(line.quantity) > 20 ||
      instructions.length > 250
    ) {
      return NextResponse.json({ error: "One or more order items are invalid" }, { status: 400 });
    }
    items.push({
      item_id: line.itemId,
      item_type: itemType,
      quantity: Number(line.quantity),
      special_instructions: instructions || null,
    });
  }

  if (new Set(items.map((item) => `${item.item_type}:${item.item_id}`)).size !== items.length) {
    return NextResponse.json({ error: "Duplicate order items are not allowed" }, { status: 400 });
  }

  const accessToken = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(accessToken).digest("hex");
  if (isChoiceFixtureMode()) {
    try {
      const orderId = fixturePlaceOrder({
        name,
        items,
        trackingTokenHash: tokenHash,
      });
      const response = NextResponse.json({ orderId }, { status: 201 });
      const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
      response.headers.append(
        "Set-Cookie",
        `choice_order_access=${accessToken}; Path=/order/${orderId}; HttpOnly; SameSite=Lax; Max-Age=86400${secure}`,
      );
      response.headers.set("Cache-Control", "no-store");
      return response;
    } catch {
      return NextResponse.json(
        { error: "Your order could not be placed. Please refresh the menu and try again." },
        { status: 409 },
      );
    }
  }

  const { data, error } = await createAdminClient().rpc("place_pickup_order", {
    p_customer_name: name,
    p_items: items,
    p_tracking_token_hash: tokenHash,
  });

  if (error || typeof data !== "string") {
    return NextResponse.json(
      { error: "Your order could not be placed. Please refresh the menu and try again." },
      { status: 409 },
    );
  }

  const response = NextResponse.json({ orderId: data }, { status: 201 });
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  response.headers.append(
    "Set-Cookie",
    `choice_order_access=${accessToken}; Path=/order/${data}; HttpOnly; SameSite=Lax; Max-Age=86400${secure}`,
  );
  response.headers.set("Cache-Control", "no-store");
  return response;
}
