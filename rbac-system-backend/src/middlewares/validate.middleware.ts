import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ZodSchema } from "zod";
import ErrorHandler from "../utils/errorHandler.js";

type ValidationTarget = "body" | "query" | "params";

/**
 * Middleware factory that validates the request data against a Zod schema.
 * On success, replaces the target with parsed & sanitised data.
 * On failure, passes a 422 error with all Zod issue messages joined.
 *
 * @param schema  Zod schema to validate against
 * @param target  'body' | 'query' | 'params' (default: 'body')
 */
export const validate = (
  schema: ZodSchema,
  target: ValidationTarget = "body"
): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message).join("; ");
      next(new ErrorHandler(422, messages));
      return;
    }

    // Replace the request field with parsed + type-coerced data
    if (target === "body") {
      req.body = result.data as Record<string, unknown>;
    } else if (target === "query") {
      // Express types query as ParsedQs; we merge to preserve Express internals
      Object.assign(req.query, result.data);
    } else {
      Object.assign(req.params, result.data);
    }

    next();
  };
