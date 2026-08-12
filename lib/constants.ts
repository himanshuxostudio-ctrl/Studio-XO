export const SITE_NAME = "Studio XO";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.studioxo.in";
export const SITE_DESCRIPTION =
  "Studio XO is a live-entertainment, dining and nightlife brand across India — live music, comedy, Sufi nights, private parties and Room XO's techno floor.";

export const NAV_LINKS = [
  { label: "Events", href: "/events" },
  { label: "Outlets", href: "/outlets" },
  { label: "Private Parties", href: "/private-parties" },
  { label: "About XO", href: "/about" },
  { label: "Room XO", href: "/room-xo" },
  { label: "Contact", href: "/contact" },
] as const;

export const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
] as const;

export const EVENT_CATEGORY_LABELS: Record<string, string> = {
  "live-music": "Live Music",
  "dj-night": "DJ Night",
  techno: "Techno",
  comedy: "Comedy",
  sufi: "Sufi Night",
  bollywood: "Bollywood",
  "special-event": "Special Event",
  "ladies-night": "Ladies Night",
  brunch: "Brunch",
  festival: "Festival",
};

export const OUTLET_STATUS_LABELS: Record<string, string> = {
  operational: "Open Now",
  renovation: "Under Renovation",
  "reopening-soon": "Reopening Soon",
};

export const TICKET_PLATFORM_LABELS: Record<string, string> = {
  bookmyshow: "BookMyShow",
  district: "District",
  skillboxes: "Skillboxes",
  custom: "Get Tickets",
  none: "Tickets",
};

export const GENERAL_WHATSAPP_NUMBER = "919205888734";
export const GENERAL_EMAIL = "studioxo24@gmail.com";

export const INSTAGRAM_HANDLES = {
  "studio-xo": "https://www.instagram.com/studioxoofficial/",
  "room-xo": "https://www.instagram.com/roomxoofficial/",
};
