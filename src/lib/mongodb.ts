// Extend the NodeJS global type to include _mongoClientPromise
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export default clientPromise;

/*
  ERROR: querySrv ENOTFOUND _mongodb._tcp.cluster.mongodb.net

  This error means your MongoDB connection string (MONGODB_URI) is using the "mongodb+srv://" protocol,
  but your environment cannot resolve the DNS for your MongoDB Atlas cluster.

  How to fix:
  1. Double-check your .env file for a valid MONGODB_URI.
     - It should look like: mongodb+srv://<user>:<pass>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority
  2. Make sure you are connected to the internet and DNS is working.
  3. If you are behind a firewall or proxy, ensure DNS SRV records can be resolved.
  4. If you cannot use SRV, use the standard protocol:
     - Change "mongodb+srv://" to "mongodb://"
     - Replace the host with your cluster's direct node addresses (from MongoDB Atlas dashboard).
  5. If running locally, try restarting your machine or router.

  This is a configuration/network issue, not a code bug.
*/
