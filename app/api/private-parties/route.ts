import { NextRequest, NextResponse } from "next/server";
import { privatePartySchema } from "@/lib/validation";
import { saveEnquiry } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { isRateLimited } from "@/lib/rate-limit";
import type { PrivatePartyEnquiry } from "@/lib/types";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(`private-party:${ip}`)) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = privatePartySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form data", issues: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.website) {
    return NextResponse.json({ success: true });
  }

  const enquiry: PrivatePartyEnquiry = {
    id: generateId(),
    type: "private-party",
    createdAt: new Date().toISOString(),
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email,
    city: parsed.data.city,
    outletSlug: parsed.data.outletSlug || undefined,
    eventDate: parsed.data.eventDate,
    guests: parsed.data.guests,
    eventType: parsed.data.eventType,
    budget: parsed.data.budget || undefined,
    message: parsed.data.message || undefined,
  };

  await saveEnquiry(enquiry);

  return NextResponse.json({ success: true, id: enquiry.id });
}
