import { NextRequest, NextResponse } from "next/server";
import { reservationSchema } from "@/lib/validation";
import { saveEnquiry, getOutletBySlug } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { isRateLimited } from "@/lib/rate-limit";
import type { ReservationEnquiry } from "@/lib/types";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(`reservation:${ip}`)) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = reservationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form data", issues: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.website) {
    return NextResponse.json({ success: true });
  }

  const outlet = await getOutletBySlug(parsed.data.outletSlug);
  if (!outlet) {
    return NextResponse.json({ error: "Selected outlet was not found" }, { status: 400 });
  }

  const enquiry: ReservationEnquiry = {
    id: generateId(),
    type: "reservation",
    createdAt: new Date().toISOString(),
    outletSlug: parsed.data.outletSlug,
    eventSlug: parsed.data.eventSlug || undefined,
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email || undefined,
    date: parsed.data.date,
    time: parsed.data.time,
    guests: parsed.data.guests,
    occasion: parsed.data.occasion || undefined,
    additionalRequest: parsed.data.additionalRequest || undefined,
    source: "website",
    status: "new",
  };

  await saveEnquiry(enquiry);

  return NextResponse.json({ success: true, id: enquiry.id });
}
