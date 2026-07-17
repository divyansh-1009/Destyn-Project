/**
 * MongoDB Connection Utility
 */

import { MongoClient } from "mongodb";
import { DB_NAME } from "./constants";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI;

let clientPromise: Promise<MongoClient>;

const options = {
  maxPoolSize: 50,
  minPoolSize: 10,
  maxIdleTimeMS: 10000,
};

if (!uri) {
  clientPromise = Promise.reject(
    new Error("[mongodb] MONGODB_URI environment variable is not set.")
  );
} else if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri, options).connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri, options).connect();
}

/**
 * Returns a connected MongoClient and the application database.
 */
export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  return { client, db };
}

export default clientPromise;
