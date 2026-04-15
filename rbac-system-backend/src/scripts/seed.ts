
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

import { connectDb } from "../config/db.js";
import { User } from "../models/user.model.js";
import { Role, Status } from "../utils/constants.js";

const ADMIN_EMAIL = "admin@purplemerit.com";
const ADMIN_PASSWORD = "Admin@123456";
const ADMIN_NAME = "Super Admin";

const seed = async (): Promise<void> => {
  console.log("🌱 Starting database seed...\n");

  await connectDb();

  // ── Idempotency check ──
  const existingAdmin = await User.findOne({ role: Role.ADMIN }).select("email");
  if (existingAdmin) {
    console.log(`✅ Admin user already exists (${existingAdmin.email}). Skipping seed.`);
    await mongoose.connection.close();
    process.exit(0);
  }

  // ── Create Super Admin ──
  const admin = await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: Role.ADMIN,
    status: Status.ACTIVE,
  });

  console.log("✅ Super Admin created successfully!");
  console.log("─────────────────────────────────────");
  console.log(`   Name     : ${admin.name}`);
  console.log(`   Email    : ${ADMIN_EMAIL}`);
  console.log(`   Password : ${ADMIN_PASSWORD}`);
  console.log(`   ID       : ${String(admin._id)}`);
  console.log("─────────────────────────────────────");
  console.log("\n⚠️  IMPORTANT: Change the admin password immediately after first login!\n");

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error("❌ Seed failed:", message);
  process.exit(1);
});
