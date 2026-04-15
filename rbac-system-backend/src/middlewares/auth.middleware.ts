import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { Types } from "mongoose";
import { User } from "../models/user.model.js";
import { Status, type Role } from "../utils/constants.js";
import ErrorHandler from "../utils/errorHandler.js";

interface AccessTokenPayload {
  userId: string;
  role: Role;
  iat: number;
  exp: number;
}

/**
 * Protects routes by verifying the Bearer JWT access token.
 *
 * Flow:
 *  1. Extract token from Authorization header
 *  2. Verify signature + expiry with JWT_ACCESS_SECRET
 *  3. Fetch user from DB to confirm they still exist and are active
 *  4. Attach lightweight user object to req.user
 *
 * Responds with:
 *  - 401 if token is missing, invalid, or expired
 *  - 403 if user account is inactive
 */
export const verifyToken = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      next(new ErrorHandler(401, "Access token is required. Use Authorization: Bearer <token>"));
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      next(new ErrorHandler(401, "Access token is missing"));
      return;
    }

    // Verify token
    let decoded: AccessTokenPayload;
    try {
      decoded = jwt.verify(
        token,
        process.env["JWT_ACCESS_SECRET"] as string
      ) as AccessTokenPayload;
    } catch (err: unknown) {
      if (err instanceof jwt.TokenExpiredError) {
        next(new ErrorHandler(401, "Access token has expired. Please refresh your session."));
      } else {
        next(new ErrorHandler(401, "Invalid access token"));
      }
      return;
    }

    // Confirm user still exists and is active
    const user = await User.findById(decoded.userId).select(
      "_id name email role status"
    );

    if (!user) {
      next(new ErrorHandler(401, "User no longer exists. Please log in again."));
      return;
    }

    if (user.status === Status.INACTIVE) {
      next(
        new ErrorHandler(
          403,
          "Your account has been deactivated. Please contact an administrator."
        )
      );
      return;
    }

    // Attach user to request context
    req.user = {
      _id: user._id as Types.ObjectId,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error: unknown) {
    next(error);
  }
};
