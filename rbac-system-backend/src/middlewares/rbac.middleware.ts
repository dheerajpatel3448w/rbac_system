import type { Request, Response, NextFunction, RequestHandler } from "express";
import { type Role } from "../utils/constants.js";
import ErrorHandler from "../utils/errorHandler.js";


 
export const authorizeRoles = (...allowedRoles: Role[]): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ErrorHandler(401, "Authentication required"));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        new ErrorHandler(
          403,
          `Access denied. This action requires one of the following roles: [${allowedRoles.join(
            ", "
          )}]. Your current role: ${req.user.role}`
        )
      );
      return;
    }

    next();
  };
