// check-live-results.mjs
// Read-only script: prints today's + yesterday's results, but ONLY for games
// that actually exist in your `games` collection (mirrors lib/data.ts logic).
//
// Setup:
//   npm install mongodb dotenv
// Run:
//   node check-live-results.mjs
//
// Requires MONGODB_URI (and optionally MONGODB_DB) in your .env.local

import { MongoClient, ObjectId } from "mongodb";
import { config } from "dotenv";

config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  console.error("Missing MONGODB_URI in .env.local");
  process.exit(1);
}

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function normalizeGame(doc, index) {
  const name = String(doc.name ?? doc.gameName ?? doc.title ?? "Game");
  const shortName = String(doc.shortName ?? doc.code ?? name.slice(0, 2)).toUpperCase();
  return {
    id: String(doc._id ?? doc.id ?? name.toLowerCase()),
    name,
    shortName,
    resultTime: String(doc.resultTime ?? doc.time ?? ""),
    sortOrder: Number(doc.sortOrder ?? doc.order ?? index)
  };
}

function normalizeResult(doc) {
  const rawGame = doc.game ?? doc.gameId ?? doc.gameName ?? doc.market ?? doc.name;
  const rawDate = doc.resultDate ?? doc.date ?? doc.day;
  const result = String(doc.result ?? doc.resultNumber ?? doc.number ?? doc.value ?? "XX").padStart(2, "0");
  return {
    game: rawGame instanceof ObjectId ? rawGame.toString() : String(rawGame ?? ""),
    date: rawDate instanceof Date ? toDateKey(rawDate) : String(rawDate ?? ""),
    result
  };
}

function gameResultFilter(games) {
  const values = new Set();
  games.forEach((g) => {
    [g.id, g.name, g.shortName].forEach((v) => v && values.add(v));
  });
  const arr = Array.from(values);
  return { $or: [{ game: { $in: arr } }, { gameId: { $in: arr } }, { gameName: { $in: arr } }, { market: { $in: arr } }] };
}

function resultFor(results, game, dateKey) {
  const match = results.find((r) => {
    const g = r.game.toLowerCase();
    return r.date === dateKey && [game.id, game.name, game.shortName].some((k) => g === k.toLowerCase());
  });
  return match?.result ?? "XX";
}

async function main() {
  // secondaryPreferred + no write calls anywhere below = read-only usage
  const client = new MongoClient(uri, { readConcern: { level: "majority" }, readPreference: "secondaryPreferred" });
  await client.connect();
  const db = client.db(dbName);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const todayKey = toDateKey(today);
  const yesterdayKey = toDateKey(yesterday);

  const gameDocs = await db
    .collection("games")
    .find({ $or: [{ isActive: true }, { isActive: { $exists: false } }] })
    .sort({ sortOrder: 1, resultTime: 1 })
    .toArray();

  const games = gameDocs.map(normalizeGame).sort((a, b) => a.sortOrder - b.sortOrder);

  if (!games.length) {
    console.log("No games found in the `games` collection.");
    await client.close();
    return;
  }

  const filter = {
    $and: [
      { $or: [{ resultDate: { $in: [todayKey, yesterdayKey] } }, { date: { $in: [todayKey, yesterdayKey] } }] },
      gameResultFilter(games)
    ]
  };

  let resultDocs = await db.collection("gameresults").find(filter).toArray();
  if (!resultDocs.length) {
    resultDocs = await db.collection("results").find(filter).toArray();
  }
  const results = resultDocs.map(normalizeResult);

  console.log(`\nLive results — ${todayKey} (today) / ${yesterdayKey} (yesterday)\n`);
  console.log("Game".padEnd(20), "Time".padEnd(12), "Yesterday".padEnd(10), "Today");
  console.log("-".repeat(55));
  games.forEach((game) => {
    console.log(
      game.name.padEnd(20),
      game.resultTime.padEnd(12),
      resultFor(results, game, yesterdayKey).padEnd(10),
      resultFor(results, game, todayKey)
    );
  });

  await client.close();
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});