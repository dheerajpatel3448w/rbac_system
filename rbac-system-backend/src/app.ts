import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import hpp from "hpp";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import ErrorHandler from "./utils/errorHandler.js";

dotenv.config();

const app: Express = express();

// ─── Trust Proxy (required for Render / Railway / Heroku) ────────────────────
// Enables accurate IP detection behind reverse proxies for rate limiting.
app.set("trust proxy", 1);

// ─── Security HTTP Headers (helmet) ──────────────────────────────────────────
app.use(helmet());

// ─── Global Rate Limiter ──────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again in 15 minutes.",
  },
});
app.use(globalLimiter);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env["FRONTEND_URL"] ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., Postman, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin "${origin}" is not allowed`));
      }
    },
    credentials: true,
  })
);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// ─── HTTP Parameter Pollution Protection ─────────────────────────────────────
app.use(hpp());

// ─── Request Logger ───────────────────────────────────────────────────────────
app.use(morgan(process.env["NODE_ENV"] === "production" ? "combined" : "dev"));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/v1/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "RBAC User Management System is healthy",
    environment: process.env["NODE_ENV"] ?? "development",
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

// ─── 404 — Unknown Route ──────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "The route you are looking for does not exist",
  });
});

// ─── Global Error Handler (must be last) ──────────────────────────────────────
// Single source of truth for ALL error responses in the application.
app.use(
  (
    err: ErrorHandler | Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ): void => {
    const statusCode = err instanceof ErrorHandler ? err.statusCode : 500;

    // In production, hide internal error details for 500s
    const message =
      process.env["NODE_ENV"] === "production" && statusCode === 500
        ? "An unexpected error occurred. Please try again later."
        : err.message;

    res.status(statusCode).json({
      success: false,
      message,
      // Include stack trace only in development
      ...(process.env["NODE_ENV"] === "development" && { stack: err.stack }),
    });
  }
);

export default app;