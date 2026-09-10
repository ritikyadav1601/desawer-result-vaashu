import { ObjectId } from "mongodb";
import { getGamesAndResults, getResultsDb } from "./results-mongodb";

export type StoredGameResult = { gameId: string; date: string; result: string };
export type MainGameOption = { id: string; name: string };

export async function getMainGames(): Promise<MainGameOption[]> {
  const { games } = await getGamesAndResults("main", []);
  return games.map((game) => ({ id: game._id.toString(), name: game.name }));
}

export async function saveMainGameResult(entry: StoredGameResult) {
  if (!ObjectId.isValid(entry.gameId)) throw new Error("Invalid MongoDB game ID.");
  await (await getResultsDb("main")).collection("gameresults").updateOne(
    { game: new ObjectId(entry.gameId), resultDate: entry.date },
    { $set: { result: entry.result, updatedAt: new Date() } },
    { upsert: true }
  );
}

export async function getMainGameResultsForDates(dates: string[]) {
  const { games, results } = await getGamesAndResults("main", dates);
  const names = new Set(games.map((game) => game._id.toString()));
  return results.filter((result) => names.has(result.game.toString())).map((result) => ({
    gameId: result.game.toString(), date: result.resultDate, result: String(result.result || "XX")
  }));
}

export async function getMainGameResultsForMonth(year: number, monthIndex: number, gameId: string) {
  if (!ObjectId.isValid(gameId)) return [];
  const month = String(monthIndex + 1).padStart(2, "0");
  const db = await getResultsDb("main");
  const rows = await db.collection("gameresults").find({
    game: new ObjectId(gameId), resultDate: { $gte: `${year}-${month}-01`, $lte: `${year}-${month}-31` }
  }).toArray();
  return rows.map((row) => ({ gameId, date: String(row.resultDate), result: String(row.result || "XX") }));
}
