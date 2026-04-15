import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import type { Response } from "express";
import type { Types } from "mongoose";
import type { Role } from "../utils/constants.js";

// ─── Token Payload Shape ──────────────────────────────────────────────────────

export interface AccessTokenPayload {
  userId: string | Types.ObjectId;
  role: Role;
}

export interface RefreshTokenPayload {
  userId: string | Types.ObjectId;
}

// ─── Token Generation ─────────────────────────────────────────────────────────

/**
 * Generates a short-lived access token (default 15m).
 * Sent in response body — client stores in memory (NOT localStorage).
 */
export const generateAccessToken = (payload: AccessTokenPayload): string => {
  const options: SignOptions = {
    expiresIn: (process.env["JWT_ACCESS_EXPIRES_IN"] ?? "15m") as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, process.env["JWT_ACCESS_SECRET"] as string, options);
};

/**
 * Generates a long-lived refresh token (default 7d).
 * Sent as HttpOnly cookie — not accessible via JS.
 */
export const generateRefreshToken = (userId: string | Types.ObjectId): string => {
  const options: SignOptions = {
    expiresIn: (process.env["JWT_REFRESH_EXPIRES_IN"] ?? "7d") as SignOptions["expiresIn"],
  };
  return jwt.sign({ userId }, process.env["JWT_REFRESH_SECRET"] as string, options);
};

// ─── Token Hashing ────────────────────────────────────────────────────────────

/**
 * SHA-256 hashes a token for safe DB storage.
 * Even if DB is breached, raw tokens cannot be replayed.
 */
export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// ─── Cookie Helpers ───────────────────────────────────────────────────────────

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: process.env["NODE_ENV"] === "production" ? "strict" : "lax",
    maxAge: SEVEN_DAYS_MS,
    path: "/",
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: process.env["NODE_ENV"] === "production" ? "strict" : "lax",
    path: "/",
  });
};
