"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { attemptLogin, isSetupComplete, logout } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { isRateLimited } from "@/lib/rate-limit";

export async function loginAction(formData: FormData) {
  if (!(await isSetupComplete())) {
    redirect("/admin/setup");
  }

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") || "unknown";
  if (isRateLimited(`admin-login:${ip}`)) {
    redirect("/admin/login?error=" + encodeURIComponent("Too many attempts. Please wait a minute and try again."));
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email")?.toString() || "",
    password: formData.get("password")?.toString() || "",
  });

  if (!parsed.success) {
    redirect("/admin/login?error=" + encodeURIComponent("Enter a valid email and password."));
  }

  const result = await attemptLogin(parsed.data.email, parsed.data.password);
  if (!result.ok) {
    redirect("/admin/login?error=" + encodeURIComponent(result.error));
  }

  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}
