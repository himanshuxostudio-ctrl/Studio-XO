export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function formatEventDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatEventDateShort(isoDate: string): { day: string; month: string; weekday: string } {
  const date = new Date(`${isoDate}T00:00:00`);
  return {
    day: date.toLocaleDateString("en-IN", { day: "numeric" }),
    month: date.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
    weekday: date.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase(),
  };
}

export function formatTime12h(time24: string): string {
  const [hourStr, minuteStr] = time24.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr ?? "00";
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${period}`;
}

export function isPastDate(isoDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(`${isoDate}T00:00:00`);
  return eventDate < today;
}

export function isSameOrFutureDate(isoDate: string): boolean {
  return !isPastDate(isoDate);
}

export function generateId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}
