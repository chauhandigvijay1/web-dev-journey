const mongoose = require("mongoose");
const env = require("./env");

let isConnected = false;

async function connectDb() {
  if (isConnected) return mongoose.connection;

  mongoose.set("strictQuery", true);

  const conn = await mongoose.connect(env.mongoUri, {
    autoIndex: env.nodeEnv !== "production",
  });

  isConnected = conn.connection.readyState === 1;

  // eslint-disable-next-line no-console
  console.log(`MongoDB connected: ${conn.connection.host}`);

  return conn.connection;
}

module.exports = connectDb;
