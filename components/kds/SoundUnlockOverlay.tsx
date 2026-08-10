"use client";

export function SoundUnlockOverlay({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <button
        type="button"
        onClick={onUnlock}
        className="rounded-xl bg-white px-8 py-6 text-lg font-semibold shadow-xl"
      >
        Tap to enable kitchen alerts
      </button>
    </div>
  );
}
