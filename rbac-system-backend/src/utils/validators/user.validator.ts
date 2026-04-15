import { z } from "zod";
import { Role, Status } from "../constants.js";

// ─── Shared strong password rule ──────────────────────────────────────────────

const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password cannot exceed 72 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  );

// ─── Admin: Create User Schema ────────────────────────────────────────────────

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .trim(),
  email: z
    .string()
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),
  role: z.nativeEnum(Role).optional().default(Role.USER),
  status: z.nativeEnum(Status).optional().default(Status.ACTIVE),
  password: strongPassword.optional(), // if omitted, controller auto-generates
});

// ─── Admin: Update User Schema ────────────────────────────────────────────────

export const updateUserSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50).trim().optional(),
    email: z.string().email("Please provide a valid email address").toLowerCase().trim().optional(),
    role: z.nativeEnum(Role).optional(),
    status: z.nativeEnum(Status).optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field must be provided for update",
  });

// ─── User: Update Own Profile Schema ─────────────────────────────────────────

export const updateProfileSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50).trim().optional(),
    currentPassword: z.string().optional(),
    newPassword: strongPassword.optional(),
  })
  .refine(
    (data) => {
      // newPassword requires currentPassword to be present
      if (data.newPassword && !data.currentPassword) return false;
      return true;
    },
    {
      message: "Current password is required when setting a new password",
      path: ["currentPassword"],
    }
  )
  .refine((data) => data.name !== undefined || data.newPassword !== undefined, {
    message: "At least one field (name or newPassword) must be provided",
  });

// ─── Pagination / Filter Query Schema ─────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(Status).optional(),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
