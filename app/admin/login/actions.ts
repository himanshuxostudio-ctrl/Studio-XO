"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { computeAdminToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

export async function loginAction(formData: FormData) {
  const password = formData.get("password")?.toString() || "";
  const token = computeAdminToken(password);

  if (!token) {
    redirect("/admin/login?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect("/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}
