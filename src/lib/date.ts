export function toLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function shiftDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toLocalDateKey(date);
}

export function formatEntryDate(value: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en", options ?? { month: "short", day: "numeric" }).format(
    new Date(`${value}T12:00:00`),
  );
}
