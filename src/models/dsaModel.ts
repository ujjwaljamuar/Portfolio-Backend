import mongoose, { Schema, Document } from "mongoose";
import { DsaProblem } from "../types/dsa.types.js";

export interface DsaProblemDocument extends DsaProblem, Document {}

const DsaApproachSchema = new Schema(
  {
    order: { type: Number, default: 0 },
    title: { type: String, required: true, trim: true },
    intuition: { type: String, required: true },
    approach: { type: String, required: true },
    solution: { type: String, required: true },
  },
  { _id: false },
);

const DsaProblemSchema = new Schema<DsaProblemDocument>(
  {
    title: { type: String, required: true, trim: true, index: true },

    platform: {
      type: String,
      enum: ["LeetCode", "NeetCode", "InterviewBit", "Custom"],
      default: "Custom",
    },

    problemUrl: String,

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
      index: true,
    },

    tags: {
      type: [String],
      default: [],
      index: true,
    },

    status: {
      type: String,
      enum: ["Todo", "Solved"],
      required: true,
      index: true,
    },

    needsRevision: {
      type: Boolean,
      default: false,
      index: true,
    },

    question: { type: String, required: true },

    approaches: {
      type: [DsaApproachSchema],
      // validate: {
      //   validator: (approaches: unknown[]) => approaches.length > 0,
      //   message: "At least one approach is required",
      // },
    },

    notes: String,

    revisionCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastRevisedAt: Date,
  },
  { timestamps: true },
);

DsaProblemSchema.index({ title: "text", tags: "text", notes: "text" });

export default mongoose.model<DsaProblemDocument>(
  "DsaProblem",
  DsaProblemSchema,
  "dsa_problems",
);
