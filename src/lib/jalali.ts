import { format as formatJalali, parse as parseJalali } from "date-fns-jalali";
import { faIR } from "date-fns-jalali/locale";

export function toJalali(date: Date | string | null | undefined, pattern = "yyyy/MM/dd"): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return formatJalali(d, pattern, { locale: faIR });
}

export function toJalaliDateTime(date: Date | string | null | undefined): string {
  return toJalali(date, "yyyy/MM/dd - HH:mm");
}

export function monthRange(year: number, month: number): { start: Date; end: Date } {
  // month is 1-12 Jalali; convert boundaries via date-fns-jalali parse
  const startStr = `${year}/${String(month).padStart(2, "0")}/01`;
  const start = parseJalali(startStr, "yyyy/MM/dd", new Date());
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const endStr = `${nextYear}/${String(nextMonth).padStart(2, "0")}/01`;
  const end = parseJalali(endStr, "yyyy/MM/dd", new Date());
  return { start, end };
}

export function currentJalaliYearMonth(): { year: number; month: number } {
  const now = new Date();
  return {
    year: Number(formatJalali(now, "yyyy")),
    month: Number(formatJalali(now, "M")),
  };
}
