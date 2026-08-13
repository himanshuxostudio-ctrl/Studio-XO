"use server";

import { updateLeadStatus } from "@/lib/db";
import { requireSection } from "@/lib/auth";
import type { LeadStatus } from "@/lib/types";

export async function updateLeadStatusAction(formData: FormData) {
  await requireSection("private-parties");
  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString() as LeadStatus | undefined;
  if (!id || !status) return;
  await updateLeadStatus(id, status);
}
