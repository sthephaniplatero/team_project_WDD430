import "server-only";
import { getServers, setServers } from "node:dns";
import mongoose from "mongoose";

/**
 * Cached Mongoose connection.
 *
 * In development, Next.js hot-reloads modules, which would open a new
 * connection on every change. Storing the connection (and the in-flight
 * promise) on globalThis lets every reload and every request reuse it.
 */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cache: MongooseCache =
  globalForMongoose.mongooseCache ?? (globalForMongoose.mongooseCache = { conn: null, promise: null });

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined. Add it to .env.local (see .env.example).");
  }

  const dnsServers = process.env.MONGODB_DNS_SERVERS
    ?.split(",")
    .map((server) => server.trim())
    .filter(Boolean);
  if (dnsServers?.length) {
    setServers(dnsServers);
  }
  if (process.env.NODE_ENV === "development") {
    console.info("MongoDB DNS servers:", getServers());
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null; // allow a retry on the next call
    throw error;
  }

  return cache.conn;
}

export const connectToDatabase = connectDB;
export default connectDB;
