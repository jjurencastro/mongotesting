/**
 * Shared MongoDB connection helper for Vercel serverless functions.
 *
 * Serverless functions can be "warm-started", so we cache the connection
 * on the global object to avoid reconnecting on every request.
 *
 * Locally:  falls back to the Docker container at localhost:27017
 * On Vercel: set the MONGODB_URI environment variable (MongoDB Atlas string)
 */
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "schoolDB";

// Cache across warm invocations (standard Vercel/Atlas pattern)
if (!global._mongoClientPromise) {
  const client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}

async function getDb() {
  const client = await global._mongoClientPromise;
  return client.db(dbName);
}

module.exports = { getDb };
