import type { Types } from "mongoose";
import type { Role, Status } from "../utils/constants.js";

/**
 * Augment Express's Request to carry the authenticated user payload.
 * Populated by the verifyToken middleware after JWT validation.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: Types.ObjectId;
        role: Role;
        status: Status;
        email: string;
        name: string;
      };
    }
  }
}

export {};
