import mongoose from "mongoose";
import config from "./config.js";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

const connectDB = async (): Promise<typeof mongoose> => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(config.mongoUri, {
      dbName: "portfolio",
    });
  }

  cached.conn = await cached.promise;
  console.log("MongoDB connected successfully");
  return cached.conn;
};

export default connectDB;
