const env = require("./config/env");
const connectDb = require("./config/db");
const app = require("./app");

let server;

const startServer = async () => {
  await connectDb();
  server = app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${env.port}`);
  });
};

const shutdown = (signal) => {
  // eslint-disable-next-line no-console
  console.log(`${signal} received. Shutting down gracefully...`);
  if (!server) {
    process.exit(0);
    return;
  }
  server.close(() => {
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  // eslint-disable-next-line no-console
  console.error("Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  // eslint-disable-next-line no-console
  console.error("Uncaught Exception:", error);
});

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});


