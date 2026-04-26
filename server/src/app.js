import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import healthRoutes from "./routes/health.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Welcome to the MERN backend" });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);

export default app;
