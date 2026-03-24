import mongoose from "mongoose";

export async function connectMongo(uri) {
  if (!uri) throw new Error("MONGO_URI is required");
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });
}
