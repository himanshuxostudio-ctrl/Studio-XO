import type { Outlet, Event } from "./types";
import { formatEventDate, formatTime12h } from "./utils";

function normalizeNumber(number: string): string {
  return number.replace(/[^\d]/g, "");
}

export function buildWhatsAppUrl(number: string, message: string): string {
  const normalized = normalizeNumber(number);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function tableReservationMessage(params: {
  outletName: string;
  guests?: number;
  date?: string;
  time?: string;
  name?: string;
}): string {
  const { outletName, guests, date, time, name } = params;
  const parts = [`Hi, I'd like to reserve a table at ${outletName}`];
  if (guests) parts.push(`for ${guests} guests`);
  if (date) parts.push(`on ${formatEventDate(date)}`);
  if (time) parts.push(`around ${formatTime12h(time)}`);
  let message = `${parts.join(" ")}.`;
  if (name) message += ` My name is ${name}.`;
  return message;
}

export function eventEnquiryMessage(event: Event, outlet: Outlet): string {
  return `Hi, I'm interested in "${event.name}" at ${outlet.name} on ${formatEventDate(event.date)}. Could you share more details?`;
}

export function privatePartyMessage(outletName?: string): string {
  return outletName
    ? `Hi, I'd like to plan a private party at ${outletName}. Could you share availability and details?`
    : `Hi, I'd like to plan a private party with Studio XO. Could you share availability and details?`;
}

export function generalEnquiryMessage(outletName?: string): string {
  return outletName
    ? `Hi, I have a question about ${outletName}.`
    : `Hi, I have a question about Studio XO.`;
}

export function adminReservationFollowUp(params: { name: string; outletName: string; date: string; time: string; guests: number }): string {
  const { name, outletName, date, time, guests } = params;
  return `Hi ${name}, this is ${outletName} following up on your table request for ${guests} guests on ${formatEventDate(date)} at ${formatTime12h(time)}.`;
}

export function adminLeadFollowUp(params: { name: string; eventType: string }): string {
  return `Hi ${params.name}, this is Studio XO following up on your ${params.eventType.toLowerCase()} enquiry.`;
}
