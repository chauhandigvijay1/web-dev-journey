import mongoose from "mongoose";

export function getHealth(req, res) {
  const dbState = mongoose.connection.readyState;
  const dbStatus = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" }[dbState] || "unknown";

  if (dbState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database not connected",
      data: { db: dbStatus },
    });
  }

  res.json({
    success: true,
    data: {
      status: "healthy",
      db: dbStatus,
      uptime: process.uptime(),
    },
  });
}
