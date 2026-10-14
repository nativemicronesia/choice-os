export function DataModeNotice({ className = "" }: { className?: string }) {
  if (process.env.NEXT_PUBLIC_CHOICE_DATA_MODE !== "fixtures") return null;
  return (
    <div className={`border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-950 ${className}`}>
      Development fixtures · Orders and edits are simulated in memory and reset when the app restarts. No database is connected.
    </div>
  );
}
