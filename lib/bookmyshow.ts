import "server-only";

export interface ParsedBookMyShowEvent {
  name?: string;
  description?: string;
  imageUrl?: string;
  date?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm, 24h
  venueName?: string;
  city?: string;
  ticketUrl?: string;
}

export class BookMyShowImportError extends Error {}

const ALLOWED_HOSTS = ["bookmyshow.com", "in.bookmyshow.com", "www.bookmyshow.com"];

function isAllowedHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return ALLOWED_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}

function firstJsonLdEventValue<T>(html: string, pick: (obj: Record<string, unknown>) => T | undefined): T | undefined {
  const blocks = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);

  for (const block of blocks) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(block[1].trim());
    } catch {
      continue;
    }

    const candidates: Record<string, unknown>[] = [];
    const collect = (node: unknown) => {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) {
        node.forEach(collect);
        return;
      }
      const obj = node as Record<string, unknown>;
      candidates.push(obj);
      if (Array.isArray(obj["@graph"])) (obj["@graph"] as unknown[]).forEach(collect);
    };
    collect(parsed);

    for (const obj of candidates) {
      const type = obj["@type"];
      const typeStr = Array.isArray(type) ? type.join(",") : String(type || "");
      if (!typeStr.toLowerCase().includes("event")) continue;
      const value = pick(obj);
      if (value !== undefined) return value;
    }
  }

  return undefined;
}

function metaContent(html: string, property: string): string | undefined {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${property}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']*)["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHtmlEntities(match[1]);
  }
  return undefined;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function splitIsoDateTime(iso: string | undefined): { date?: string; time?: string } {
  if (!iso) return {};
  const match = iso.match(/^(\d{4}-\d{2}-\d{2})T?(\d{2}:\d{2})?/);
  if (!match) return {};
  return { date: match[1], time: match[2] };
}

function resolveImage(image: unknown): string | undefined {
  if (typeof image === "string") return image;
  if (Array.isArray(image)) return resolveImage(image[0]);
  if (image && typeof image === "object" && "url" in image) return (image as { url?: string }).url;
  return undefined;
}

function resolveOfferUrl(offers: unknown): string | undefined {
  if (!offers) return undefined;
  if (Array.isArray(offers)) return resolveOfferUrl(offers[0]);
  if (typeof offers === "object" && "url" in offers) return (offers as { url?: string }).url;
  return undefined;
}

function resolveLocation(location: unknown): { name?: string; city?: string } {
  if (!location || typeof location !== "object") return {};
  if (Array.isArray(location)) return resolveLocation(location[0]);
  const loc = location as Record<string, unknown>;
  const name = typeof loc.name === "string" ? loc.name : undefined;
  const address = loc.address;
  let city: string | undefined;
  if (address && typeof address === "object") {
    const addr = address as Record<string, unknown>;
    if (typeof addr.addressLocality === "string") city = addr.addressLocality;
  } else if (typeof address === "string") {
    city = address;
  }
  return { name, city };
}

/** Parses a fetched HTML document for schema.org Event JSON-LD, falling
 * back to Open Graph tags. Pure function — no network access — so it can be
 * exercised directly against fixture HTML. */
export function parseEventHtml(html: string): ParsedBookMyShowEvent {
  const name = firstJsonLdEventValue(html, (o) => (typeof o.name === "string" ? o.name : undefined)) || metaContent(html, "og:title");

  const description =
    firstJsonLdEventValue(html, (o) => (typeof o.description === "string" ? o.description : undefined)) || metaContent(html, "og:description");

  const imageUrl = firstJsonLdEventValue(html, (o) => resolveImage(o.image)) || metaContent(html, "og:image");

  const startDate = firstJsonLdEventValue(html, (o) => (typeof o.startDate === "string" ? o.startDate : undefined));
  const { date, time } = splitIsoDateTime(startDate);

  const location = firstJsonLdEventValue(html, (o) => resolveLocation(o.location)) || {};
  const ticketUrl = firstJsonLdEventValue(html, (o) => resolveOfferUrl(o.offers)) || metaContent(html, "og:url");

  return {
    name: name ? decodeHtmlEntities(name) : undefined,
    description: description ? decodeHtmlEntities(description) : undefined,
    imageUrl,
    date,
    startTime: time,
    venueName: location.name,
    city: location.city,
    ticketUrl,
  };
}

/** Fetches a public BookMyShow event page and parses it. Never attempts to
 * bypass CAPTCHAs, logins or robots restrictions — a blocked or non-200
 * response simply surfaces as an error so the admin can fall back to manual
 * entry, per the brief. */
export async function fetchBookMyShowEvent(url: string): Promise<ParsedBookMyShowEvent> {
  if (!isAllowedHost(url)) {
    throw new BookMyShowImportError("That doesn't look like a bookmyshow.com event URL.");
  }

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; StudioXOAdminImporter/1.0; +https://www.studioxo.in)",
        Accept: "text/html",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new BookMyShowImportError("Couldn't reach that URL. Check the link and your server's network access, or enter the event manually.");
  }

  if (!response.ok) {
    throw new BookMyShowImportError(`BookMyShow returned ${response.status}. The page may be blocked or no longer available — enter the event manually.`);
  }

  const html = await response.text();
  const parsed = parseEventHtml(html);

  if (!parsed.name) {
    throw new BookMyShowImportError("Couldn't find event details on that page. Enter the event manually.");
  }

  return parsed;
}
