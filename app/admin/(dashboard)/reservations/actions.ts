"use server";

import { updateReservationStatus } from "@/lib/db";
import { requireSection } from "@/lib/auth";
import type { ReservationStatus } from "@/lib/types";

export async function updateReservationStatusAction(formData: FormData) {
  await requireSection("reservations");
  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString() as ReservationStatus | undefined;
  if (!id || !status) return;
  await updateReservationStatus(id, status);
}
