"use server";

import { redirect } from "next/navigation";
import { setupSchema } from "@/lib/validation";
import { isSetupComplete, hashPassword, attemptLogin } from "@/lib/auth";
import { saveUser } from "@/lib/db";
import { generateId } from "@/lib/utils";
import type { AdminUser } from "@/lib/types";

export async function setupAction(formData: FormData) {
  if (await isSetupComplete()) {
    redirect("/admin/login");
  }

  const setupToken = process.env.ADMIN_SETUP_TOKEN;
  if (!setupToken) {
    redirect("/admin/setup?error=" + encodeURIComponent("ADMIN_SETUP_TOKEN is not configured on the server."));
  }

  const parsed = setupSchema.safeParse({
    setupToken: formData.get("setupToken")?.toString() || "",
    name: formData.get("name")?.toString() || "",
    email: formData.get("email")?.toString() || "",
    password: formData.get("password")?.toString() || "",
    confirmPassword: formData.get("confirmPassword")?.toString() || "",
  });

  if (!parsed.success) {
    redirect("/admin/setup?error=" + encodeURIComponent(parsed.error.issues[0]?.message || "Please check the form and try again."));
  }

  if (parsed.data.setupToken !== setupToken) {
    redirect("/admin/setup?error=" + encodeURIComponent("Incorrect setup token."));
  }

  const user: AdminUser = {
    id: generateId(),
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    passwordHash: await hashPassword(parsed.data.password),
    role: "super-admin",
    active: true,
    createdAt: new Date().toISOString(),
  };

  await saveUser(user);
  await attemptLogin(parsed.data.email, parsed.data.password);
  redirect("/admin");
}
