import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import mindMapRoutes from "./routes/mindMapRoutes.js";

const app = express();

app.use(
  cors({
    origin: env.clientOrigin
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/maps", mindMapRoutes);

export default app;
