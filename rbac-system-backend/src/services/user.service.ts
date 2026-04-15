import mongoose from "mongoose";
import type { Types } from "mongoose";
import { User, type IUser } from "../models/user.model.js";
import { Role, Status } from "../utils/constants.js";

// ─── Filter type ──────────────────────────────────────────────────────────────
// Avoids importing FilterQuery which conflicts with mongooses CJS export= under
// moduleResolution:nodenext. Matches the shape accepted by User.find().

interface UserFilter {
  $or?: Array<{
    name?: { $regex: string; $options: string };
    email?: { $regex: string; $options: string };
  }>;
  role?: Role;
  status?: Status;
}

// Separate interface for the email uniqueness query
interface EmailFilter {
  email: string;
  _id?: { $ne: string | Types.ObjectId };
}

// ─── Query Interfaces ─────────────────────────────────────────────────────────

export interface PaginationQuery {
  page: number;
  limit: number;
  search?: string;
  role?: Role;
  status?: Status;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Returns a paginated, filtered list of users.
 * Parallel count + data query for best performance.
 */
export const findAllUsers = async (
  query: PaginationQuery
): Promise<PaginatedResult<IUser>> => {
  const { page = 1, limit = 10, search, role, status } = query;

  const filter: UserFilter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (role) filter.role = role;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    User.find(filter as unknown as Parameters<(typeof User)["find"]>[0])
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: false }),
    User.countDocuments(filter as unknown as Parameters<(typeof User)["countDocuments"]>[0]),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: data as unknown as IUser[],
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Finds a single user by ID and populates audit fields.
 */
export const findUserById = async (
  id: string | Types.ObjectId
): Promise<IUser | null> => {
  return User.findById(id)
    .populate("createdBy", "name email role")
    .populate("updatedBy", "name email role");
};

/**
 * Checks if an email is already taken by another user.
 * @param email      The email to check
 * @param excludeId  Optionally exclude a user (for update-self checks)
 */
export const isEmailTaken = async (
  email: string,
  excludeId?: string | Types.ObjectId
): Promise<boolean> => {
  const filter: EmailFilter = { email: email.toLowerCase() };
  if (excludeId) {
    filter._id = { $ne: excludeId };
  }
  const existing = await User.findOne(filter as unknown as Parameters<(typeof User)["findOne"]>[0]).select("_id");
  return existing !== null;
};
