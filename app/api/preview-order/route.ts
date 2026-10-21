import { NextResponse } from "next/server";
import { MAX_QTY, MENU_BY_ID } from "@/lib/storefront/catalog";
import { submitPreviewOrder, type PreviewOrderRequest } from "@/lib/storefront/demo-orders";

const LOCATIONS = ["dine-in", "stop-by", "undecided"] as const;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Partial<PreviewOrderRequest> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const contact = typeof body.contact === "string" ? body.contact.trim() : "";
  const note = typeof body.note === "string" ? body.note.trim() : "";
  const location = LOCATIONS.find((value) => value === body.location) ?? "undecided";
  const lines = Array.isArray(body.lines) ? body.lines : [];

  if (!name || name.length > 80) return NextResponse.json({ error: "Please add a name." }, { status: 400 });
  if (contact.length > 120 || note.length > 300) return NextResponse.json({ error: "That text is too long." }, { status: 400 });
  if (lines.length < 1 || lines.length > MENU_BY_ID.size) return NextResponse.json({ error: "Your order is empty." }, { status: 400 });

  const seen = new Set<string>();
  for (const line of lines) {
    const valid = line && MENU_BY_ID.has(line.itemId) && !seen.has(line.itemId)
      && Number.isInteger(line.quantity) && line.quantity >= 1 && line.quantity <= MAX_QTY;
    if (!valid) return NextResponse.json({ error: "One of the selected items is not valid." }, { status: 400 });
    seen.add(line.itemId);
  }

  const record = submitPreviewOrder({ name, contact, note, location, lines });
  return NextResponse.json({ reference: record.reference, demo: true });
}
