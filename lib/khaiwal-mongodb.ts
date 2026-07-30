import { MongoClient, type Db } from "mongodb";

const databaseName = process.env.KHAIWAL_MONGODB_DATABASE || "khaiwal_management";

declare global {
  var khaiwalMongoClientPromise: Promise<MongoClient> | undefined;
}

function clientPromise() {
  const uri = process.env.KHAIWAL_MONGODB_URI?.trim();
  if (!uri) throw new Error("KHAIWAL_MONGODB_URI is not configured.");

  if (!global.khaiwalMongoClientPromise) {
    global.khaiwalMongoClientPromise = new MongoClient(uri).connect();
  }

  return global.khaiwalMongoClientPromise;
}

export async function getKhaiwalDb(): Promise<Db> {
  return (await clientPromise()).db(databaseName);
}
