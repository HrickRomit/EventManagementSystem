import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import healthRoutes from "./routes/health.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import eventRoutes from "./routes/event.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import { handleStripeWebhook } from "./controllers/payment.controller.js";

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const isDevelopment = process.env.NODE_ENV !== "production";
const isLocalDevOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
const isVercelDomain = (origin) => /^https:\/\/.*\.vercel\.app$/.test(origin);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || (isDevelopment && isLocalDevOrigin(origin)) || isVercelDomain(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    }
  })
);
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);
app.use(express.json({ limit: "5mb" }));

app.get("/", (_req, res) => {
  res.json({ message: "Welcome to the MERN backend" });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/payments", paymentRoutes);

export default app;
