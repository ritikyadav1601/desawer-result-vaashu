// inspect-collections.mjs
// Read-only: prints a few real documents from `games` and `gameresults`
// so we can see the ACTUAL field names/types your DB uses.
//
// Run: node inspect-collections.mjs

import { MongoClient } from "mongodb";
import { config } from "dotenv";

config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  console.log("Using database:", db.databaseName, "\n");

  console.log("=== Sample from `games` (2 docs) ===");
  const games = await db.collection("games").find({}).limit(2).toArray();
  console.log(JSON.stringify(games, null, 2));

  console.log("\n=== Sample from `gameresults` (3 most recent docs) ===");
  const results = await db
    .collection("gameresults")
    .find({})
    .sort({ _id: -1 })
    .limit(3)
    .toArray();
  console.log(JSON.stringify(results, null, 2));

  await client.close();
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
