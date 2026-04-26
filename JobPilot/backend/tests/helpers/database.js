import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { clearMailOutbox, resetMailTransporter } from "../../src/services/mail.service.js";

let mongoServer;

export async function startTestDatabase() {
  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create();
  }

  const uri = mongoServer.getUri();
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(uri);
  }

  clearMailOutbox();
  resetMailTransporter();
}

export async function resetTestDatabase() {
  clearMailOutbox();
  resetMailTransporter();

  if (mongoose.connection.readyState !== 1) return;
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
}

export async function stopTestDatabase() {
  clearMailOutbox();
  resetMailTransporter();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
}
