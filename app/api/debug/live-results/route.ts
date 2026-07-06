// app/api/debug/live-results/route.ts
// Read-only debug endpoint: returns today's + yesterday's results, but ONLY
// for games that exist in the `games` collection (same logic as lib/data.ts).
// No writes are performed anywhere in this file.

import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getHomeData } from "@/lib/data";

export const dynamic = "force-dynamic"; // always hit the DB, never cache this debug route

export async function GET() {
  try {
    // Reuses the exact same read-only query logic the homepage uses,
    // so this endpoint can't drift from what's shown on the site.
    const data = await getHomeData(new Date());

    const liveResults = data.boardRows.map((game) => ({
      name: game.name,
      shortName: game.shortName,
      resultTime: game.resultTime,
      yesterday: game.yesterday,
      today: game.today,
      chartSlug: game.chartSlug
    }));

    return NextResponse.json({
      updatedAt: data.updatedAt,
      selectedMonth: data.selectedMonth,
      selectedYear: data.selectedYear,
      count: liveResults.length,
      results: liveResults
    });
  } catch (error) {
    // Sanity check: confirm DB connectivity without exposing the URI/error internals
    try {
      await getDb();
    } catch {
      return NextResponse.json({ error: "Database connection failed. Check MONGODB_URI." }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to fetch live results." }, { status: 500 });
  }
}