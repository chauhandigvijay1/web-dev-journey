import express from "express";
import cors from "cors";
import { apiRouter } from "./routes/index.js";

export const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, message: "Internal server error" });
});
