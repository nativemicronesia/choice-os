"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { usePreviewCart } from "./PreviewCart";
import { MENU_BY_ID } from "@/lib/storefront/catalog";

type Sent = { reference: string; lines: { name: string; qty: number }[]; name: string };

const FIELD = "mt-1.5 min-h-12 w-full rounded-xl border border-sand-300 bg-white px-4 py-2 text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sunset-600";

export function OrderRequest() {
  const { quantities, setQty, clear } = usePreviewCart();
  const [sent, setSent] = useState<Sent | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lines = Object.entries(quantities).flatMap(([id, qty]) => {
    const item = MENU_BY_ID.get(id);
    return item ? [{ item, qty }] : [];
  });

  if (sent) {
    return (
      <div role="status" className="rounded-3xl bg-white p-6 shadow-card sm:p-10">
        <p className="inline-block rounded-full bg-sunset-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sunset-700">Demo only</p>
        <h2 className="sf-display mt-4 text-3xl font-extrabold text-ink-900 sm:text-4xl">Request received, {sent.name}.</h2>
        <p className="mt-3 max-w-xl text-ink-700">
          This is a preview. <strong>No real order was placed</strong> and nothing was sent to Choice. In the finished system, this is where the restaurant would see your request and confirm it with you.
        </p>
        <p className="mt-5 text-sm text-ink-500">Demo reference <span className="font-mono font-bold text-ink-900">{sent.reference}</span></p>
        <ul className="mt-4 divide-y divide-sand-200 border-y border-sand-200">
          {sent.lines.map((line) => <li key={line.name} className="flex justify-between py-2"><span>{line.name}</span><span className="tabular-nums text-ink-500">× {line.qty}</span></li>)}
        </ul>
        <Link href="/menu" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-ink-900 px-7 font-bold text-sand-50 transition hover:bg-sunset-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sunset-600">Back to the menu</Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-sand-300 bg-white px-6 py-14 text-center">
        <h2 className="sf-display text-3xl font-extrabold text-ink-900">Nothing selected yet</h2>
        <p className="mx-auto mt-2 max-w-sm text-ink-700">Pick a few favorites from the menu and they will show up here.</p>
        <Link href="/menu" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-sunset-500 px-7 font-extrabold text-ink-900 transition hover:bg-sunset-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900">Explore Menu →</Link>
      </div>
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/preview-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          contact: form.get("contact"),
          location: form.get("location"),
          note: form.get("note"),
          lines: lines.map(({ item, qty }) => ({ itemId: item.id, quantity: qty })),
        }),
      });
      const result = (await response.json().catch(() => null)) as { reference?: string; error?: string } | null;
      if (!response.ok || !result?.reference) throw new Error(result?.error ?? "Something went wrong. Please try again.");
      setSent({ reference: result.reference, name: String(form.get("name")).trim(), lines: lines.map(({ item, qty }) => ({ name: item.name, qty })) });
      clear();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <section aria-labelledby="your-items" className="lg:col-span-3">
        <h2 id="your-items" className="sf-display text-2xl font-extrabold text-ink-900">Your items</h2>
        <ul className="mt-4 divide-y divide-sand-200 overflow-hidden rounded-3xl bg-white shadow-card">
          {lines.map(({ item, qty }) => (
            <li key={item.id} className="flex items-center justify-between gap-4 p-4 sm:p-5">
              <div className="min-w-0">
                <p className="sf-display truncate text-lg font-bold text-ink-900">{item.name}</p>
                <p className="text-sm text-ink-500">{item.price === null ? "Price to be confirmed" : `$${item.price.toFixed(2)}`}</p>
              </div>
              <div role="group" aria-label={`${item.name} quantity`} className="inline-flex shrink-0 items-center rounded-full border border-sand-300">
                <button type="button" aria-label={`Remove one ${item.name}`} onClick={() => setQty(item.id, qty - 1)} className="flex h-11 w-11 items-center justify-center rounded-full text-xl hover:bg-sand-100 focus-visible:outline-2 focus-visible:outline-sunset-600">−</button>
                <span aria-live="polite" className="min-w-8 text-center font-bold tabular-nums">{qty}</span>
                <button type="button" aria-label={`Add one more ${item.name}`} onClick={() => setQty(item.id, qty + 1)} className="flex h-11 w-11 items-center justify-center rounded-full text-xl hover:bg-sand-100 focus-visible:outline-2 focus-visible:outline-sunset-600">+</button>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/menu" className="mt-4 inline-flex min-h-11 items-center font-bold text-sunset-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sunset-700">← Add more from the menu</Link>
      </section>

      <form onSubmit={submit} className="space-y-4 rounded-3xl bg-white p-5 shadow-card sm:p-7 lg:col-span-2 lg:self-start">
        <h2 className="sf-display text-2xl font-extrabold text-ink-900">Order request</h2>
        <label className="block text-sm font-bold text-ink-900">Your name
          <input name="name" required maxLength={80} autoComplete="name" className={FIELD} />
        </label>
        <label className="block text-sm font-bold text-ink-900">Phone or email <span className="font-normal text-ink-500">(optional)</span>
          <input name="contact" maxLength={120} autoComplete="tel" className={FIELD} />
        </label>
        <fieldset>
          <legend className="text-sm font-bold text-ink-900">Preferred location <span className="font-normal text-ink-500">(not final)</span></legend>
          <div className="mt-2 grid gap-2">
            {[["undecided", "Not sure yet"], ["dine-in", "The Restaurant (dine-in)"], ["stop-by", "The Stop-by Shop"]].map(([value, label], i) => (
              <label key={value} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-sand-300 px-4 has-[:checked]:border-sunset-600 has-[:checked]:bg-sunset-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sunset-600">
                <input type="radio" name="location" value={value} defaultChecked={i === 0} className="h-4 w-4 accent-sunset-600" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="block text-sm font-bold text-ink-900">Notes <span className="font-normal text-ink-500">(optional)</span>
          <textarea name="note" rows={3} maxLength={300} className={`${FIELD} py-3`} />
        </label>
        {error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className="min-h-14 w-full rounded-full bg-sunset-500 text-lg font-extrabold text-ink-900 transition hover:bg-sunset-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900 disabled:cursor-wait disabled:opacity-60">
          {busy ? "Sending…" : "Send demo order request"}
        </button>
        <p className="text-xs leading-5 text-ink-500">Preview only: this does not place a real order. No payment is taken online, and pickup, location and confirmation details are still to be confirmed with Choice.</p>
      </form>
    </div>
  );
}
