import type { Event, FAQItem, Outlet } from "./types";
import { SITE_NAME, SITE_URL } from "./constants";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    sameAs: ["https://www.instagram.com/studioxoofficial/", "https://www.instagram.com/roomxoofficial/"],
  };
}

export function localBusinessSchema(outlet: Outlet) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": outlet.brand === "room-xo" ? "NightClub" : "BarOrPub",
    name: outlet.name,
    url: `${SITE_URL}/outlets/${outlet.slug}`,
    telephone: outlet.phones[0],
    image: outlet.heroImage.src.startsWith("/placeholder") ? undefined : `${SITE_URL}${outlet.heroImage.src}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: outlet.address,
      addressLocality: outlet.city,
      addressRegion: outlet.state,
      addressCountry: "IN",
    },
  };
  if (outlet.coordinates) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: outlet.coordinates.lat,
      longitude: outlet.coordinates.lng,
    };
  }
  return schema;
}

export function eventSchema(event: Event, outlet: Outlet) {
  const status = event.cancelled
    ? "https://schema.org/EventCancelled"
    : event.soldOut
      ? "https://schema.org/EventScheduled"
      : "https://schema.org/EventScheduled";

  return {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name: event.name,
    startDate: event.startTime ? `${event.date}T${event.startTime}:00+05:30` : event.date,
    endDate: event.endTime ? `${event.date}T${event.endTime}:00+05:30` : undefined,
    eventStatus: status,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: outlet.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: outlet.address,
        addressLocality: outlet.city,
        addressRegion: outlet.state,
        addressCountry: "IN",
      },
    },
    image: event.artwork.src.startsWith("/placeholder") ? undefined : `${SITE_URL}${event.artwork.src}`,
    description: event.description.join(" "),
    offers: event.ticket.url
      ? {
          "@type": "Offer",
          url: event.ticket.url,
          availability: event.soldOut ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
        }
      : undefined,
    organizer: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function faqSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
