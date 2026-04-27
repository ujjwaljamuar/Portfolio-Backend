import mongoose, { Schema, Document } from "mongoose";

export interface AdminDocument extends Document {
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  resetToken?: string;
  resetTokenExpiry?: number;
}

const AdminSchema = new Schema<AdminDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false }, // hashed
    resetToken: { type: String, default: undefined },
    resetTokenExpiry: { type: Number, default: undefined },
  },
  { timestamps: true },
);

export default mongoose.model<AdminDocument>("Admin", AdminSchema);
