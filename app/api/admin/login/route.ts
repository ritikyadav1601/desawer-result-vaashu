import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCredentials, makeAdminSession, MAX_AGE } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const configured = adminCredentials();
  const username = String(form.get("username") || "");
  const password = String(form.get("password") || "");
  if (!configured.username || !configured.password || username !== configured.username || password !== configured.password) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url));
  }

  const response = NextResponse.redirect(new URL("/admin/dashboard", request.url));
  response.cookies.set(ADMIN_COOKIE, makeAdminSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/"
  });
  return response;
}
