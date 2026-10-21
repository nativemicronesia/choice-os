import { NextResponse } from "next/server";
import { previewOsEnabled } from "@/lib/auth/preview";

export const dynamic = "force-dynamic";

// Menu feed: the OS publishes Turay's demo menu here so the public Menu can
// read it where practical (GET). The OS browser store stays the source of
// truth; this is a best-effort, in-memory mirror that may reset on redeploy.
type FeedDish = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  available: boolean;
  group: "todays" | "featured";
};

declare global {
  var __choicePreviewMenu: { dishes: FeedDish[]; updatedAt: string } | undefined;
}

const NO_STORE = { "Cache-Control": "no-store" };
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function GET() {
  if (!previewOsEnabled()) return new NextResponse(null, { status: 404 });
  return NextResponse.json(globalThis.__choicePreviewMenu ?? { dishes: null, updatedAt: null }, { headers: NO_STORE });
}

export async function PUT(request: Request) {
  if (!previewOsEnabled()) return new NextResponse(null, { status: 404 });
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    return NextResponse.json({ error: "Cross-origin writes are not allowed." }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as { dishes?: unknown } | null;
  if (!body || !Array.isArray(body.dishes) || body.dishes.length > 80) {
    return NextResponse.json({ error: "Invalid menu." }, { status: 400 });
  }
  const dishes: FeedDish[] = [];
  for (const raw of body.dishes as Record<string, unknown>[]) {
    const id = text(raw?.id, 60);
    const name = text(raw?.name, 80);
    if (!id || !name) continue;
    const price = typeof raw.price === "number" && Number.isFinite(raw.price) && raw.price >= 0 ? raw.price : null;
    dishes.push({
      id,
      name,
      description: text(raw.description, 300),
      price,
      available: raw.available === true,
      group: raw.group === "featured" ? "featured" : "todays",
    });
  }
  globalThis.__choicePreviewMenu = { dishes, updatedAt: new Date().toISOString() };
  return NextResponse.json({ ok: true, count: dishes.length }, { headers: NO_STORE });
}
