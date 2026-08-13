"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { saveSettings } from "@/lib/db";
import { requireSection } from "@/lib/auth";

export async function saveSettingsAction(formData: FormData) {
  await requireSection("settings");

  const generalWhatsappNumber = (formData.get("generalWhatsappNumber")?.toString() || "").replace(/\D/g, "");
  const generalEmail = (formData.get("generalEmail")?.toString() || "").trim();

  if (!generalWhatsappNumber || !generalEmail) {
    redirect("/admin/settings?error=" + encodeURIComponent("Both fields are required."));
  }

  await saveSettings({ generalWhatsappNumber, generalEmail });

  // These values are read on every page via the root layout and a handful
  // of server components — revalidate broadly so the change is visible
  // immediately across the site.
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}
