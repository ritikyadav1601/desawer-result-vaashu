// debug-db.mjs
// Diagnostic: lists databases, collections, and document counts so we can
// find where your actual game/result data lives. Read-only.
//
// Run: node debug-db.mjs

import { MongoClient } from "mongodb";
import { config } from "dotenv";

config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI");
  process.exit(1);
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();

  console.log("Connected OK.\n");
  console.log("MONGODB_DB env var is:", JSON.stringify(process.env.MONGODB_DB));

  const admin = client.db().admin();
  const { databases } = await admin.listDatabases();

  for (const dbInfo of databases) {
    if (["admin", "local", "config"].includes(dbInfo.name)) continue;
    const db = client.db(dbInfo.name);
    const collections = await db.listCollections().toArray();
    console.log(`\nDatabase: ${dbInfo.name}`);
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`  - ${col.name} (${count} docs)`);
    }
  }

  await client.close();
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
