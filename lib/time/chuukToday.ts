// Chuuk (FSM) is UTC+10 year-round — no DST — so a fixed offset is safe,
// no timezone-database dependency needed.
const CHUUK_OFFSET_MIN = 600;

export function chuukTodayRangeUtc(now = new Date()): { startUtc: Date; endUtc: Date } {
  const shifted = new Date(now.getTime() + CHUUK_OFFSET_MIN * 60_000);
  shifted.setUTCHours(0, 0, 0, 0);
  const startUtc = new Date(shifted.getTime() - CHUUK_OFFSET_MIN * 60_000);
  const endUtc = new Date(startUtc.getTime() + 24 * 3_600_000);
  return { startUtc, endUtc };
}
