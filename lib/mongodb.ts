import { MongoClient, type MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {
  readConcern: { level: "majority" },
  readPreference: "secondaryPreferred"
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (uri && process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else if (uri) {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDb() {
  if (!clientPromise) {
    throw new Error("Missing MONGODB_URI. Add it to .env.local to load live data.");
  }

  const connectedClient = await clientPromise;
  return connectedClient.db(process.env.MONGODB_DB);
}
