const env = require("./config/env");
const connectDb = require("./config/db");
const app = require("./app");

let server;

const startServer = async () => {
  try {
    await connectDb();

    server = app.listen(env.port, () => {
      console.log(`✅ Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

const shutdown = (signal) => {
  console.log(`⚠️ ${signal} received. Shutting down gracefully...`);

  if (!server) return process.exit(0);

  server.close(() => {
    console.log("🛑 Server closed");
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
});

startServer();