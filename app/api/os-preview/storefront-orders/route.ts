import { NextResponse } from "next/server";
import { previewOsEnabled } from "@/lib/auth/preview";

export const dynamic = "force-dynamic";

// Read-only window onto the public storefront's demo order records. The
// storefront (lib/storefront/demo-orders.ts) keeps them on this global and owns
// the writes; reading the global means the OS needs no import from storefront
// files. Demo only: process memory, no database, nothing leaves this server.
declare global {
  var __choicePreviewOrders: unknown[] | undefined;
}

export async function GET() {
  if (!previewOsEnabled()) return new NextResponse(null, { status: 404 });
  const orders = Array.isArray(globalThis.__choicePreviewOrders) ? globalThis.__choicePreviewOrders : [];
  return NextResponse.json({ orders }, { headers: { "Cache-Control": "no-store" } });
}
