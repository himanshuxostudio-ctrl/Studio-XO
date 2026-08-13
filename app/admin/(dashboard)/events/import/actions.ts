"use server";

import { redirect } from "next/navigation";
import { requireSection } from "@/lib/auth";
import { fetchBookMyShowEvent, BookMyShowImportError, type ParsedBookMyShowEvent } from "@/lib/bookmyshow";

async function tryImport(url: string): Promise<ParsedBookMyShowEvent> {
  try {
    return await fetchBookMyShowEvent(url);
  } catch (err) {
    const message = err instanceof BookMyShowImportError ? err.message : "Import failed. Enter the event manually.";
    redirect("/admin/events/import?error=" + encodeURIComponent(message));
  }
}

export async function importFromBookMyShowAction(formData: FormData) {
  await requireSection("events");

  const url = formData.get("url")?.toString().trim() || "";
  if (!url) {
    redirect("/admin/events/import?error=" + encodeURIComponent("Paste a BookMyShow event URL first."));
  }

  const parsed = await tryImport(url);

  const draftParams = new URLSearchParams({ draft: "1", sourceUrl: url });
  if (parsed.name) draftParams.set("name", parsed.name);
  if (parsed.description) draftParams.set("description", parsed.description);
  if (parsed.imageUrl) draftParams.set("artworkSrc", parsed.imageUrl);
  if (parsed.date) draftParams.set("date", parsed.date);
  if (parsed.startTime) draftParams.set("startTime", parsed.startTime);
  if (parsed.ticketUrl) {
    draftParams.set("ticketUrl", parsed.ticketUrl);
    draftParams.set("ticketPlatform", "bookmyshow");
  }

  redirect(`/admin/events/new?${draftParams.toString()}`);
}
