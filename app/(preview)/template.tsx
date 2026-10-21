// Re-mounts on every navigation, so the short enter fade replays per page.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="sf-page">{children}</div>;
}
