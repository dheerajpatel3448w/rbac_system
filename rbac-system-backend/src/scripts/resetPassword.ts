import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

import { connectDb } from "../config/db.js";
import { User } from "../models/user.model.js";
import { Role, Status } from "../utils/constants.js";

const ADMIN_EMAIL = "admin@purplemerit.com";
const ADMIN_PASSWORD = "Admin@123456";
const ADMIN_NAME = "Super Admin";

const resetPassword = async (): Promise<void> => {
  console.log("🔄 Force-resetting admin account...\n");

  await connectDb();

  // ── Step 1: Hard delete any existing admin ──
  const deleted = await User.deleteOne({ email: ADMIN_EMAIL });
  console.log(`🗑️  Deleted ${deleted.deletedCount} existing admin document(s).`);

  // ── Step 2: Manually hash password (bypass pre-save hook ambiguity) ──
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
  console.log("🔐 Fresh hash generated:", hashedPassword.slice(0, 15) + "...");

  // ── Step 3: Create directly via insertOne to avoid any hook chain ──
  await User.collection.insertOne({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: Role.ADMIN,
    status: Status.ACTIVE,
    createdBy: null,
    updatedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("✅ Admin inserted directly into MongoDB.");

  // ── Step 4: Verify the hash works immediately ──
  const verifyUser = await User.findOne({ email: ADMIN_EMAIL }).select("+password");
  if (!verifyUser?.password) {
    console.error("❌ Could not fetch password field for verification.");
    await mongoose.connection.close();
    process.exit(1);
  }

  const verifyResult = await bcrypt.compare(ADMIN_PASSWORD, verifyUser.password);
  console.log("🧪 Verification (bcrypt.compare):", verifyResult ? "✅ PASS" : "❌ FAIL");

  if (!verifyResult) {
    console.error("❌ Hash verification failed! Something is wrong with bcrypt.");
    await mongoose.connection.close();
    process.exit(1);
  }

  console.log("\n─────────────────────────────────────");
  console.log(`   Email    : ${ADMIN_EMAIL}`);
  console.log(`   Password : ${ADMIN_PASSWORD}`);
  console.log("─────────────────────────────────────");
  console.log("✅ Admin account ready! You can now login.\n");

  await mongoose.connection.close();
  process.exit(0);
};

resetPassword().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error("❌ Reset failed:", message);
  process.exit(1);
});
