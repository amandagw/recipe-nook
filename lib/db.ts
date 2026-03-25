import { MongoClient, ServerApiVersion } from "mongodb";

declare global {
  var __recipeNookMongoClientPromise__: Promise<MongoClient> | undefined;
}

function getClientPromise() {
  if (global.__recipeNookMongoClientPromise__) {
    return global.__recipeNookMongoClientPromise__;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true
    }
  });

  const clientPromise = client.connect();

  if (process.env.NODE_ENV !== "production") {
    global.__recipeNookMongoClientPromise__ = clientPromise;
  }

  return clientPromise;
}

export async function getDatabase() {
  const connectedClient = await getClientPromise();
  return connectedClient.db("recipe-nook");
}
