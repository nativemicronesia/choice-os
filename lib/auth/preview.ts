/**
 * Preview mode opens the private /os workspace without a login so Turay can
 * explore it immediately. It touches no database: all data is demonstration
 * data kept in the browser. The owner-session foundation (lib/auth/session.ts,
 * proxy.ts, /login, requireOwnerSession) is untouched. Set CHOICE_OS_PREVIEW=off
 * to put /os behind the owner login again; /os/live is always login-gated.
 */
export function previewOsEnabled(): boolean {
  return process.env.CHOICE_OS_PREVIEW?.trim().toLowerCase() !== "off";
}
