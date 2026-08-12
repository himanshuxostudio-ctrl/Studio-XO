"use client";

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

function pushDataLayer(event: string, params: EventParams) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
  if (window.gtag) window.gtag("event", event, params);
}

function pushPixel(event: string, params: EventParams) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("trackCustom", event, params);
}

function track(event: string, params: EventParams = {}) {
  pushDataLayer(event, params);
  pushPixel(event, params);
}

export const analytics = {
  pageView: (path: string) => track("page_view", { path }),
  eventView: (params: { event_name: string; event_id: string; outlet: string; city: string; event_date: string }) =>
    track("event_view", params),
  outletView: (params: { outlet: string; city: string }) => track("outlet_view", params),
  ticketClick: (params: { event_name: string; event_id: string; outlet: string; city: string; ticket_platform: string }) =>
    track("ticket_click", params),
  tableBookingClick: (params: { outlet: string; city: string; event_name?: string }) =>
    track("table_booking_click", params),
  whatsappClick: (params: { outlet?: string; city?: string; context: string }) => track("whatsapp_click", params),
  phoneClick: (params: { outlet?: string; city?: string }) => track("phone_click", params),
  directionsClick: (params: { outlet?: string; city?: string }) => track("directions_click", params),
  instagramClick: (params: { outlet?: string; brand?: string }) => track("instagram_click", params),
  privatePartyLead: (params: { city?: string; outlet?: string }) => track("private_party_lead", params),
  reservationSubmit: (params: { outlet: string; city: string; guests: number }) => track("reservation_submit", params),
  eventFilter: (params: { city?: string; category?: string; month?: string }) => track("event_filter", params),
  locationSelect: (params: { outlet: string; city: string }) => track("location_select", params),
};
