require("./config/env");
const mongoose = require("mongoose");
const connectDb = require("./config/db");
const app = require("./app");
const env = require("./config/env");

let server;

const startServer = async () => {
  try {
    await connectDb();

    server = app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);

  if (!server) {
    mongoose.disconnect().catch(() => {}).finally(() => process.exit(0));
    return;
  }

  server.closeIdleConnections?.();

  server.close(async () => {
    console.log("Server closed");
    await mongoose.disconnect().catch(() => {});
    console.log("MongoDB disconnected");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    mongoose.disconnect().catch(() => {}).finally(() => process.exit(1));
  }, 10000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Promise Rejection:", reason);
  shutdown("unhandledRejection");
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  shutdown("uncaughtException");
});

startServer();
