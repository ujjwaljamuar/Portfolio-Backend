import mongoose, { Schema, Document } from "mongoose";
import { Blog } from "../types/blogs.types.js";

export interface BlogDocument extends Blog, Document {}

const BlogSchema = new Schema<BlogDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },

    summary: String,

    content: { type: String, required: true },

    coverImage: String,
    tags: [String],

    status: {
      type: String,
      enum: ["draft", "published", "hidden"],
      default: "draft",
    },
  },
  { timestamps: true },
);

export default mongoose.model<BlogDocument>("Blog", BlogSchema);
