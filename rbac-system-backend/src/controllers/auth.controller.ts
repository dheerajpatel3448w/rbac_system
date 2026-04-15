import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { Types } from "mongoose";
import { TryCatch } from "../utils/TryCatch.js";
import { User } from "../models/user.model.js";
import ErrorHandler from "../utils/errorHandler.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "../services/auth.service.js";

// ─── POST /api/v1/auth/register ──────────────────────────────────────────────

export const register = TryCatch(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    // Check for duplicate email
    const existing = await User.findOne({ email }).select("_id");
    if (existing) {
      throw new ErrorHandler(409, "An account with this email already exists");
    }

    // Create user (password is hashed in pre-save hook)
    const user = await User.create({ name, email, password });

    // Issue tokens
    const accessToken = generateAccessToken({
      userId: user._id as Types.ObjectId,
      role: user.role,
    });
    const refreshToken = generateRefreshToken(user._id as Types.ObjectId);

    // Store hashed refresh token in DB
    await User.findByIdAndUpdate(user._id, {
      refreshToken: hashToken(refreshToken),
    });

    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      accessToken,
      user,
    });
  }
);

// ─── POST /api/v1/auth/login ──────────────────────────────────────────────────

export const login = TryCatch(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    // Fetch user with password (select: false on schema)
    const user = await User.findOne({ email }).select("+password");

    // Use same error for wrong email OR wrong password (prevent email enumeration)
    if (!user || !(await user.comparePassword(password))) {
      throw new ErrorHandler(401, "Invalid email or password");
    }

    if (user.status === "inactive") {
      throw new ErrorHandler(
        403,
        "Your account has been deactivated. Please contact an administrator."
      );
    }

    // Issue tokens
    const accessToken = generateAccessToken({
      userId: user._id as Types.ObjectId,
      role: user.role,
    });
    const refreshToken = generateRefreshToken(user._id as Types.ObjectId);

    await User.findByIdAndUpdate(user._id, {
      refreshToken: hashToken(refreshToken),
    });

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      user: user.toJSON(), // sensitive fields stripped by toJSON transform
    });
  }
);

// ─── POST /api/v1/auth/logout ─────────────────────────────────────────────────

export const logout = TryCatch(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    // Invalidate the stored refresh token so it can never be reused
    if (req.user?._id) {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    }

    clearRefreshTokenCookie(res);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }
);

// ─── POST /api/v1/auth/refresh ────────────────────────────────────────────────

export const refreshAccessToken = TryCatch(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const cookieToken = req.cookies["refreshToken"] as string | undefined;

    if (!cookieToken) {
      next(new ErrorHandler(401, "Refresh token not found. Please log in."));
      return;
    }

    // Verify refresh token signature
    let decoded: { userId: string };
    try {
      decoded = jwt.verify(
        cookieToken,
        process.env["JWT_REFRESH_SECRET"] as string
      ) as { userId: string };
    } catch {
      // Clear invalid cookie
      clearRefreshTokenCookie(res);
      next(new ErrorHandler(401, "Refresh token is invalid or expired. Please log in again."));
      return;
    }

    // Validate against hashed token stored in DB (prevents token replay after logout)
    const hashedIncoming = hashToken(cookieToken);
    const user = await User.findOne({
      _id: decoded.userId,
      refreshToken: hashedIncoming,
    }).select("+refreshToken");

    if (!user) {
      clearRefreshTokenCookie(res);
      next(new ErrorHandler(401, "Session is no longer valid. Please log in again."));
      return;
    }

    const newAccessToken = generateAccessToken({
      userId: user._id as Types.ObjectId,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  }
);

// ─── GET /api/v1/auth/me ──────────────────────────────────────────────────────

export const getMe = TryCatch(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const user = await User.findById(req.user?._id)
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role");

    if (!user) {
      throw new ErrorHandler(404, "User not found");
    }

    res.status(200).json({ success: true, user });
  }
);
