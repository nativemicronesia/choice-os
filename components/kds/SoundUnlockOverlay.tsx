"use client";

export function SoundUnlockOverlay({ onUnlock, error }: { onUnlock: () => void; error?: string | null }) {
  return (
    <div className="mb-4 flex flex-col gap-2 rounded-xl border border-ocean-100 bg-ocean-50 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-ocean-900">Kitchen sound alerts are off</p>
        <p className="text-sm text-ink-700">Tickets still refresh automatically. Enable a chime for new orders.</p>
        {error ? <p role="alert" className="mt-1 text-sm text-red-700">{error}</p> : null}
      </div>
      <button
        type="button"
        onClick={onUnlock}
        className="min-h-11 shrink-0 rounded-lg bg-ocean-700 px-4 py-2 text-sm font-semibold text-white"
      >
        Enable chime
      </button>
    </div>
  );
}
