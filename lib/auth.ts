import "server-only";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserByEmail, getUserById, getUsers } from "./db";
import { canAccess, type Section } from "./permissions";
import type { AdminUser } from "./types";

export const SESSION_COOKIE = "xo_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function sessionSecret(): string | null {
  return process.env.SESSION_SECRET || null;
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function createSessionToken(userId: string): string | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const payload = `${userId}.${Date.now() + SESSION_TTL_MS}`;
  const signature = sign(payload, secret);
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

function verifySessionToken(token: string): { userId: string } | null {
  const secret = sessionSecret();
  if (!secret) return null;

  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const [userId, expiresAtRaw, signature] = decoded.split(".");
    if (!userId || !expiresAtRaw || !signature) return null;

    const expected = sign(`${userId}.${expiresAtRaw}`, secret);
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expected);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

    if (Date.now() > Number(expiresAtRaw)) return null;
    return { userId };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function isSetupComplete(): Promise<boolean> {
  const users = await getUsers();
  return users.length > 0;
}

export async function attemptLogin(email: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getUserByEmail(email);
  if (!user || !user.active) {
    return { ok: false, error: "Incorrect email or password." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "Incorrect email or password." };
  }

  const token = createSessionToken(user.id);
  if (!token) {
    return { ok: false, error: "Server is missing SESSION_SECRET — admin sign-in is disabled until it's configured." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });

  return { ok: true };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const verified = verifySessionToken(token);
  if (!verified) return null;

  const user = await getUserById(verified.userId);
  if (!user || !user.active) return null;
  return user;
}

/** Use in admin layouts/pages: redirects to login when not authenticated. */
export async function requireAuth(): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** Use in admin pages/Server Actions: redirects when the user's role can't access this section. */
export async function requireSection(section: Section): Promise<AdminUser> {
  const user = await requireAuth();
  if (!canAccess(user.role, section)) redirect("/admin?error=forbidden");
  return user;
}
