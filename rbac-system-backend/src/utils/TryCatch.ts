import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Async controller wrapper that catches any thrown error and forwards it
 * to Express's next() — allowing the global error handler in app.ts to
 * produce a consistent { success, message } response for ALL errors.
 *
 * Usage:
 *   export const myController = TryCatch(async (req, res) => { ... });
 */
export const TryCatch =
  (
    controller: (req: Request, res: Response, next: NextFunction) => Promise<void>
  ): RequestHandler =>
  async (req, res, next): Promise<void> => {
    try {
      await controller(req, res, next);
    } catch (error: unknown) {
      next(error);
    }
  };
