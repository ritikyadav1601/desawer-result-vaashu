import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const month = searchParams.get("month") ?? "January";
  const year = searchParams.get("year") ?? new Date().getFullYear().toString();

  redirect(`/${month}-${year}`);
}
