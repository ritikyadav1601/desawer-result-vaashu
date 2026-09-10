import { MongoClient, type Db, type ObjectId } from "mongodb";

export type ResultSource = "main" | "extra";

export type MongoGame = { _id: ObjectId; name: string; code?: string; resultTime?: string; showIndex?: number; isActive?: boolean };
export type MongoGameResult = { game: ObjectId; resultDate: string; result?: string; updatedAt?: Date };

declare global {
  var mainResultsMongoClientPromise: Promise<MongoClient> | undefined;
  var extraResultsMongoClientPromise: Promise<MongoClient> | undefined;
}

function clientPromise(source: ResultSource) {
  const uri = (source === "main" ? process.env.MURGANN_MONGO_URI : process.env.EXTRA_GAMES_MONGO_URI)?.trim();
  if (!uri) throw new Error(`${source === "main" ? "MURGANN_MONGO_URI" : "EXTRA_GAMES_MONGO_URI"} is not configured.`);
  const key = source === "main" ? "mainResultsMongoClientPromise" : "extraResultsMongoClientPromise";
  if (!global[key]) global[key] = new MongoClient(uri).connect();
  return global[key];
}

export async function getResultsDb(source: ResultSource): Promise<Db> {
  return (await clientPromise(source)).db();
}

export async function getGamesAndResults(source: ResultSource, dates: string[]) {
  const db = await getResultsDb(source);
  const games = await db.collection<MongoGame>("games").find({ isActive: { $ne: false } }).sort({ showIndex: 1, name: 1 }).toArray();
  const gameIds = games.map((game) => game._id);
  const results = gameIds.length && dates.length
    ? await db.collection<MongoGameResult>("gameresults").find({ game: { $in: gameIds }, resultDate: { $in: dates } }).toArray()
    : [];
  return { games, results };
}

export async function getGameHistory(source: ResultSource, gameId: ObjectId, start: string, end: string) {
  const db = await getResultsDb(source);
  return db.collection<MongoGameResult>("gameresults").find({ game: gameId, resultDate: { $gte: start, $lte: end } }).sort({ resultDate: 1 }).toArray();
}
