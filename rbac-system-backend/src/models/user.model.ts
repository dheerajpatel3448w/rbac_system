import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";
import bcrypt from "bcrypt";
import { Role, Status } from "../utils/constants.js";

// ─── Document Interface ───────────────────────────────────────────────────────

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: Role;
  status: Status;
  refreshToken?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Instance Methods ─────────────────────────────────────────────────────────

interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ─── Model Type ───────────────────────────────────────────────────────────────

type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

// ─── Schema ───────────────────────────────────────────────────────────────────

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.ACTIVE,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      /**
       * Strip sensitive fields from every JSON response.
       * ret is typed as Record<string,unknown> to allow safe property deletion.
       */
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret["password"];
        delete ret["refreshToken"];
        delete ret["__v"];
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret["password"];
        delete ret["refreshToken"];
        delete ret["__v"];
        return ret;
      },
    },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// email unique index is auto-created by `unique: true` on the field.
userSchema.index({ role: 1, status: 1 });         // compound filter queries
userSchema.index({ name: "text", email: "text" }); // full-text search

// ─── Pre-save Hook: Hash Password ─────────────────────────────────────────────
// In Mongoose 9, async pre-hooks do NOT use next() — just return/throw.

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance Method: Compare Password ───────────────────────────────────────

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password as string);
};

// ─── Model Export ─────────────────────────────────────────────────────────────

export const User = mongoose.model<IUser, UserModel>("User", userSchema);
