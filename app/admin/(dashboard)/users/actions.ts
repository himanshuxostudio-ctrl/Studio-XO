"use server";

import { redirect } from "next/navigation";
import { getUsers, getUserByEmail, getUserById, saveUser, deleteUser as deleteUserFromDb } from "@/lib/db";
import { requireSection, hashPassword } from "@/lib/auth";
import { createUserSchema } from "@/lib/validation";
import { generateId } from "@/lib/utils";
import type { AdminUser, Role } from "@/lib/types";

function countActiveSuperAdmins(users: AdminUser[]): number {
  return users.filter((u) => u.role === "super-admin" && u.active).length;
}

export async function createUserAction(formData: FormData) {
  await requireSection("users");

  const parsed = createUserSchema.safeParse({
    name: formData.get("name")?.toString() || "",
    email: formData.get("email")?.toString() || "",
    password: formData.get("password")?.toString() || "",
    role: formData.get("role")?.toString() || "",
  });

  if (!parsed.success) {
    redirect("/admin/users?error=" + encodeURIComponent(parsed.error.issues[0]?.message || "Please check the form."));
  }

  const existing = await getUserByEmail(parsed.data.email);
  if (existing) {
    redirect("/admin/users?error=" + encodeURIComponent("A user with that email already exists."));
  }

  const user: AdminUser = {
    id: generateId(),
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    passwordHash: await hashPassword(parsed.data.password),
    role: parsed.data.role as Role,
    active: true,
    createdAt: new Date().toISOString(),
  };

  await saveUser(user);
  redirect("/admin/users");
}

export async function updateUserRoleAction(formData: FormData) {
  await requireSection("users");
  const id = formData.get("id")?.toString();
  const role = formData.get("role")?.toString() as Role | undefined;
  if (!id || !role) return;

  const user = await getUserById(id);
  if (!user) return;

  const users = await getUsers();
  if (user.role === "super-admin" && role !== "super-admin" && countActiveSuperAdmins(users) <= 1) {
    redirect("/admin/users?error=" + encodeURIComponent("At least one active Super Admin is required."));
  }

  user.role = role;
  await saveUser(user);
  redirect("/admin/users");
}

export async function toggleUserActiveAction(formData: FormData) {
  const currentUser = await requireSection("users");
  const id = formData.get("id")?.toString();
  if (!id) return;

  if (id === currentUser.id) {
    redirect("/admin/users?error=" + encodeURIComponent("You can't deactivate your own account."));
  }

  const user = await getUserById(id);
  if (!user) return;

  const users = await getUsers();
  if (user.role === "super-admin" && user.active && countActiveSuperAdmins(users) <= 1) {
    redirect("/admin/users?error=" + encodeURIComponent("At least one active Super Admin is required."));
  }

  user.active = !user.active;
  await saveUser(user);
  redirect("/admin/users");
}

export async function deleteUserAction(formData: FormData) {
  const currentUser = await requireSection("users");
  const id = formData.get("id")?.toString();
  if (!id) return;

  if (id === currentUser.id) {
    redirect("/admin/users?error=" + encodeURIComponent("You can't delete your own account."));
  }

  const user = await getUserById(id);
  if (!user) return;

  const users = await getUsers();
  if (user.role === "super-admin" && countActiveSuperAdmins(users) <= 1) {
    redirect("/admin/users?error=" + encodeURIComponent("At least one active Super Admin is required."));
  }

  await deleteUserFromDb(id);
  redirect("/admin/users");
}
