import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";
import { saveEnquiry } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { isRateLimited } from "@/lib/rate-limit";
import type { GeneralEnquiry } from "@/lib/types";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(`contact:${ip}`)) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form data", issues: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.website) {
    return NextResponse.json({ success: true });
  }

  const enquiry: GeneralEnquiry = {
    id: generateId(),
    type: "general",
    createdAt: new Date().toISOString(),
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email,
    outletSlug: parsed.data.outletSlug || undefined,
    message: parsed.data.message,
  };

  await saveEnquiry(enquiry);

  return NextResponse.json({ success: true, id: enquiry.id });
}
