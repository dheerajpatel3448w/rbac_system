import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login, logout, refreshAccessToken, getMe } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { registerSchema, loginSchema } from "../utils/validators/auth.validator.js";

const router = Router();

// ─── Strict rate limiter for login (brute-force protection) ──────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts from this IP. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, 
});


router.post("/register", validate(registerSchema), register);

router.post("/login", loginLimiter, validate(loginSchema), login);

router.post("/logout", verifyToken, logout);

router.post("/refresh", refreshAccessToken);

router.get("/me", verifyToken, getMe);

export default router;
