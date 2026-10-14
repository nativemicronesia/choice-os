import { WEEKDAYS, type DailySpecial } from "@/lib/types/database";

const CHUUK_OFFSET_MIN = 600;

/** Returns Sunday=0 through Saturday=6 in Chuuk's fixed UTC+10 timezone. */
export function chuukWeekday(now = new Date()): number {
  return new Date(now.getTime() + CHUUK_OFFSET_MIN * 60_000).getUTCDay();
}

export function isSpecialScheduledForWeekday(special: DailySpecial, weekday: number): boolean {
  return special.frequency === "daily" || special.weekdays.includes(weekday);
}

export function formatSpecialSchedule(special: Pick<DailySpecial, "frequency" | "weekdays">): string {
  if (special.frequency === "daily") return "Every day";
  const names = WEEKDAYS.filter((day) => special.weekdays.includes(day.value)).map((day) => day.short);
  return names.length ? `Weekly · ${names.join(", ")}` : "Weekly · no days selected";
}
