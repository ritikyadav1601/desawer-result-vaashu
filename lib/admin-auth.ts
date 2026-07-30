import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE = "desawer_admin_session";
const MAX_AGE = 60 * 60 * 24 * 7;

function secret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET is required.");
  return "desawer-local-session-secret";
}

function signature(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export function makeAdminSession() {
  const payload = String(Date.now());
  return `${payload}.${signature(payload)}`;
}

export function validAdminSession(value?: string) {
  if (!value) return false;
  const [created, received] = value.split(".");
  if (!created || !received || Date.now() - Number(created) > MAX_AGE * 1000) return false;
  const expected = signature(created);
  return expected.length === received.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

export async function requireAdmin() {
  const store = await cookies();
  if (!validAdminSession(store.get(ADMIN_COOKIE)?.value)) redirect("/admin/login");
}

export function adminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || (process.env.NODE_ENV === "development" ? "admin" : ""),
    password: process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "development" ? "admin123" : "")
  };
}

export { MAX_AGE };
