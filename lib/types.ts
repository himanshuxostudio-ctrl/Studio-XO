export type Brand = "studio-xo" | "room-xo";

export type OutletStatus = "operational" | "renovation" | "reopening-soon";

export type TicketPlatform =
  | "bookmyshow"
  | "district"
  | "skillboxes"
  | "custom"
  | "none";

export type EventCategory =
  | "live-music"
  | "dj-night"
  | "techno"
  | "comedy"
  | "sufi"
  | "bollywood"
  | "special-event"
  | "ladies-night"
  | "brunch"
  | "festival";

export interface GalleryImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface OpeningHoursEntry {
  days: string; // e.g. "Wed – Sun"
  hours: string; // e.g. "8:00 PM – 1:00 AM"
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Outlet {
  slug: string;
  name: string;
  brand: Brand;
  city: string;
  state: string;
  status: OutletStatus;
  statusMessage?: string;
  tagline: string;
  description: string[];
  heroImage: GalleryImage;
  gallery: GalleryImage[];
  address?: string;
  addressVerified: boolean;
  addressNote?: string;
  googleMapsUrl: string;
  coordinates?: GeoPoint;
  phones: string[];
  emails: string[];
  instagramUrl: string;
  instagramHandle: string;
  whatsappNumber: string;
  openingHours?: OpeningHoursEntry[];
  amenities?: string[];
  faqs?: FAQItem[];
  seoTitle: string;
  seoDescription: string;
  localSeoIntro: string;
  featured: boolean;
}

export interface Artist {
  slug: string;
  name: string;
  bio: string;
  image?: GalleryImage;
  instagramUrl?: string;
  genres?: string[];
}

export interface Ticket {
  platform: TicketPlatform;
  url?: string;
  ctaLabel: string;
}

export interface Event {
  slug: string;
  name: string;
  brand: Brand;
  artistSlugs: string[];
  outletSlug: string;
  category: EventCategory;
  date: string; // ISO date, YYYY-MM-DD
  startTime: string; // HH:mm, 24h
  endTime?: string; // HH:mm, 24h
  artwork: GalleryImage;
  gallery?: GalleryImage[];
  description: string[];
  ticket: Ticket;
  tableBookingEnabled: boolean;
  whatsappOverride?: string;
  featured: boolean;
  soldOut: boolean;
  cancelled: boolean;
  published: boolean;
  faqs?: FAQItem[];
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
}

export interface EventWithRelations extends Event {
  outlet: Outlet;
  artists: Artist[];
}

export type EnquiryType = "reservation" | "private-party" | "general" | "event";

export interface ReservationEnquiry {
  id: string;
  type: "reservation";
  createdAt: string;
  outletSlug: string;
  eventSlug?: string;
  name: string;
  phone: string;
  email?: string;
  date: string;
  time: string;
  guests: number;
  occasion?: string;
  additionalRequest?: string;
}

export interface PrivatePartyEnquiry {
  id: string;
  type: "private-party";
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  outletSlug?: string;
  eventDate: string;
  guests: number;
  eventType: string;
  budget?: string;
  message?: string;
}

export interface GeneralEnquiry {
  id: string;
  type: "general";
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  outletSlug?: string;
  message: string;
}

export type AnyEnquiry = ReservationEnquiry | PrivatePartyEnquiry | GeneralEnquiry;
