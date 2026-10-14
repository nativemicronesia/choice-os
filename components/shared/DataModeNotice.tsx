export function DataModeNotice({ className = "" }: { className?: string }) {
  if (process.env.NEXT_PUBLIC_CHOICE_DATA_MODE !== "fixtures") return null;
  return (
    <div role="status" className={`border-b border-white/10 bg-ocean-900 px-4 py-2 text-center text-xs font-medium text-white/90 ${className}`}>
      Preview mode <span className="px-1.5 text-sunset-300">·</span> Orders and menu changes are simulated; no real order is sent.
    </div>
  );
}
