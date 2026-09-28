/**
 * "May 2016 - May 2025" → "2016 to 2025"; "May 2025 - Present" → "2025 to now".
 *
 * The homepage record shows years only. The full resume keeps the months.
 * An unrecognized string passes through unchanged rather than guessing.
 */
export function condensePeriod(period: string): string {
  const match = period.match(/(\d{4})\s*[-–]\s*(?:\w+\s+)?(\d{4}|Present)/i);
  if (!match) return period;
  const [, start, end] = match;
  const until = /present/i.test(end) ? "now" : end;
  return start === until ? start : `${start} to ${until}`;
}
