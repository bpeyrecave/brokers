/** Date helpers. All ISO date strings are "yyyy-mm-dd", compared as UTC calendar days. */

export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toISODate(d);
}

export function daysBetween(fromIso: string, toIso: string): number {
  const a = parseISODate(fromIso).getTime();
  const b = parseISODate(toIso).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** yyyy-mm of the given ISO date. */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

/** The 13th of the given date's month, as an ISO date (may be a non-trading day). */
export function thirteenthOf(iso: string): string {
  return `${monthKey(iso)}-13`;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatLong(iso: string): string {
  const d = parseISODate(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function formatShort(iso: string): string {
  const d = parseISODate(iso);
  return `${MONTHS[d.getUTCMonth()].slice(0, 3)} ${d.getUTCDate()}`;
}

export function formatMonthYear(iso: string): string {
  const d = parseISODate(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatMonthShortYear(iso: string): string {
  const d = parseISODate(iso);
  return `${MONTHS[d.getUTCMonth()].slice(0, 3)} ${d.getUTCFullYear()}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}
