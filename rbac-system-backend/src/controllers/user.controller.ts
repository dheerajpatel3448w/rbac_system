import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import type { Types } from "mongoose";
import { TryCatch } from "../utils/TryCatch.js";
import { User } from "../models/user.model.js";
import ErrorHandler from "../utils/errorHandler.js";
import { Role, Status } from "../utils/constants.js";
import {
  findAllUsers,
  findUserById,
  isEmailTaken,
} from "../services/user.service.js";
import type {
  CreateUserInput,
  UpdateUserInput,
  UpdateProfileInput,
  PaginationInput,
} from "../utils/validators/user.validator.js";

// ─── GET /api/v1/users  [Admin, Manager] ─────────────────────────────────────

export const getAllUsers = TryCatch(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const query = req.query as unknown as PaginationInput;
    const requesterRole = req.user?.role;

    // Managers should only be able to view standard User accounts.
    if (requesterRole === Role.MANAGER) {
      // Forcibly apply the role filter so they cannot retrieve Admins or other Managers
      (query as any).role = Role.USER;
    }

    const result = await findAllUsers(query as any);

    res.status(200).json({
      success: true,
      ...result,
    });
  }
);

// ─── POST /api/v1/users  [Admin only] ────────────────────────────────────────

export const createUser = TryCatch(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { name, email, role, status, password } = req.body as CreateUserInput;

    if (await isEmailTaken(email)) {
      throw new ErrorHandler(409, "A user with this email already exists");
    }

    // Auto-generate a strong temporary password if admin didn't supply one
    const isAutoPassword = !password;
    const finalPassword =
      password ??
      `${crypto.randomBytes(8).toString("base64url")}Aa1!`;

    const user = await User.create({
      name,
      email,
      role,
      status,
      password: finalPassword,
      createdBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
      // Only expose temporary password when it was auto-generated
      ...(isAutoPassword && { temporaryPassword: finalPassword }),
    });
  }
);

// ─── GET /api/v1/users/:id  [Admin, Manager] ─────────────────────────────────

export const getUserById = TryCatch(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const user = await findUserById(req.params["id"] as string);

    if (!user) {
      throw new ErrorHandler(404, "User not found");
    }

    res.status(200).json({ success: true, user });
  }
);

// ─── PATCH /api/v1/users/:id  [Admin, Manager] ───────────────────────────────

export const updateUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const targetId = req.params["id"] as string;
    const requesterId = req.user?._id.toString();
    const requesterRole = req.user?.role;

    // ── Self-guard: prevent admins from shooting themselves in the foot ──
    if (targetId === requesterId) {
      const body = req.body as UpdateUserInput;

      if (body.status === Status.INACTIVE) {
        next(new ErrorHandler(400, "You cannot deactivate your own account"));
        return;
      }
      if (body.role && body.role !== Role.ADMIN) {
        next(new ErrorHandler(400, "You cannot change your own role"));
        return;
      }
    }

    // ── Fetch target user ──
    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      throw new ErrorHandler(404, "User not found");
    }

    // ── Manager restrictions ──
    if (requesterRole === Role.MANAGER) {
      if (targetUser.role !== Role.USER) {
        next(new ErrorHandler(403, "Managers can only modify User accounts"));
        return;
      }
      // Managers cannot change role or status — strip those fields
      delete (req.body as Partial<UpdateUserInput>).role;
      delete (req.body as Partial<UpdateUserInput>).status;
    }

    // ── Email uniqueness check if email is being changed ──
    const { email } = req.body as UpdateUserInput;
    if (email && (await isEmailTaken(email, targetId))) {
      throw new ErrorHandler(409, "This email is already in use by another account");
    }

    const updatedUser = await User.findByIdAndUpdate(
      targetId,
      { ...req.body, updatedBy: req.user?._id as Types.ObjectId },
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  }
);

// ─── DELETE /api/v1/users/:id  [Admin only] ──────────────────────────────────
//  Soft-delete: sets status to INACTIVE (user cannot log in)

export const deleteUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const targetId = req.params["id"] as string;

    if (targetId === req.user?._id.toString()) {
      next(new ErrorHandler(400, "You cannot delete your own account"));
      return;
    }

    const user = await User.findById(targetId);
    if (!user) {
      throw new ErrorHandler(404, "User not found");
    }

    if (user.status === Status.INACTIVE) {
      throw new ErrorHandler(409, "User is already deactivated");
    }

    await User.findByIdAndUpdate(targetId, {
      status: Status.INACTIVE,
      updatedBy: req.user?._id as Types.ObjectId,
    });

    res.status(200).json({
      success: true,
      message: `User "${user.name}" has been deactivated successfully`,
    });
  }
);

// ─── GET /api/v1/users/profile  [All roles] ──────────────────────────────────

export const getMyProfile = TryCatch(
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

// ─── PATCH /api/v1/users/profile  [All roles] ────────────────────────────────

export const updateMyProfile = TryCatch(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, newPassword, currentPassword } =
      req.body as UpdateProfileInput;

    const user = await User.findById(req.user?._id).select("+password");
    if (!user) {
      throw new ErrorHandler(404, "User not found");
    }

    if (name) {
      user.name = name;
    }

    if (newPassword) {
      // currentPassword is enforced by Zod validator, but double-check here
      if (!currentPassword) {
        next(
          new ErrorHandler(
            400,
            "Current password is required to set a new password"
          )
        );
        return;
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        next(new ErrorHandler(400, "Current password is incorrect"));
        return;
      }

      user.password = newPassword; // hashed by pre-save hook
    }

    (user as unknown as { updatedBy: Types.ObjectId }).updatedBy =
      req.user!._id;

    await user.save();

    const updated = await User.findById(user._id)
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updated,
    });
  }
);
