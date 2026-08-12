"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOutletBySlug, saveOutlet } from "@/lib/db";
import type { OutletStatus } from "@/lib/types";

function str(formData: FormData, key: string): string {
  return (formData.get(key)?.toString() || "").trim();
}

export async function saveOutletAction(formData: FormData) {
  const slug = str(formData, "slug");
  const existing = await getOutletBySlug(slug);
  if (!existing) redirect("/admin/outlets");

  const updated = {
    ...existing,
    status: (str(formData, "status") || existing.status) as OutletStatus,
    statusMessage: str(formData, "statusMessage") || undefined,
    tagline: str(formData, "tagline") || existing.tagline,
    description: str(formData, "description")
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean),
    address: str(formData, "address") || undefined,
    phones: str(formData, "phones").split(",").map((p) => p.trim()).filter(Boolean),
    emails: str(formData, "emails").split(",").map((e) => e.trim()).filter(Boolean),
    instagramUrl: str(formData, "instagramUrl") || existing.instagramUrl,
    whatsappNumber: str(formData, "whatsappNumber") || existing.whatsappNumber,
    googleMapsUrl: str(formData, "googleMapsUrl") || existing.googleMapsUrl,
    seoTitle: str(formData, "seoTitle") || existing.seoTitle,
    seoDescription: str(formData, "seoDescription") || existing.seoDescription,
    featured: formData.get("featured") === "on",
  };

  await saveOutlet(updated);

  // /admin/* is force-dynamic and never cached, so it needs no revalidation —
  // and revalidating the exact path we redirect() to below would render that
  // destination in a cookie-less revalidation context and break the auth
  // check (see the matching note in admin/events/actions.ts).
  revalidatePath("/outlets");
  revalidatePath(`/outlets/${slug}`);
  revalidatePath("/");
  redirect("/admin/outlets");
}
