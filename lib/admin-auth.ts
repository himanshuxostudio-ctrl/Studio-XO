import "server-only";
import { cookies } from "next/headers";
import crypto from "node:crypto";

export const ADMIN_COOKIE_NAME = "xo_admin_session";

function expectedToken(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function computeAdminToken(candidatePassword: string): string | null {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || candidatePassword !== expected) return null;
  return expectedToken();
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const token = expectedToken();
  if (!token) return false;
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE_NAME)?.value === token;
}
