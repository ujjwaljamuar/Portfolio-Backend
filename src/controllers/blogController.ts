import { Request, Response } from "express";
import BlogModel from "../models/blogModel.js";
import { buildJsonResponse } from "../utils/response.js";

const blogSummaryAdminProjection = "-content -coverImage";
const blogSummaryProjection = "-content";

// Create Blog
export const createBlog = async (req: Request, res: Response) => {
  try {
    const blog = await BlogModel.create(req.body);
    return res.json(
      buildJsonResponse({
        message: "Blog created successfully",
        data: blog,
      }),
    );
  } catch (error: any) {
    return res.status(500).json(
      buildJsonResponse({
        success: false,
        message: error.message || "Failed to create blog",
      }),
    );
  }
};

// Public: Get published blogs
export const getBlogs = async (_req: Request, res: Response) => {
  const blogs = await BlogModel.find({ status: "published" }).select(blogSummaryProjection).sort({
    createdAt: -1,
  });

  return res.json(
    buildJsonResponse({
      message: "Published blogs fetched successfully",
      data: blogs,
    }),
  );
};

// Public: Get by slug
export const getBlogBySlug = async (req: Request, res: Response) => {
  const blog = await BlogModel.findOne({
    slug: req.params.slug,
    status: "published",
  });

  if (!blog) {
    return res.status(404).json(
      buildJsonResponse({
        success: false,
        message: "Blog not found",
      }),
    );
  }

  return res.json(
    buildJsonResponse({
      message: "Blog fetched successfully",
      data: blog,
    }),
  );
};

// Admin: Get all blogs
export const getAllBlogsAdmin = async (_req: Request, res: Response) => {
  const blogs = await BlogModel.find().select(blogSummaryAdminProjection).sort({ createdAt: -1 });
  return res.json(
    buildJsonResponse({
      message: "All blogs fetched successfully",
      data: blogs,
    }),
  );
};

// Update Blog
export const updateBlog = async (req: Request, res: Response) => {
  const blog = await BlogModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  return res.json(
    buildJsonResponse({
      message: "Blog updated successfully",
      data: blog,
    }),
  );
};

// Delete Blog
export const deleteBlog = async (req: Request, res: Response) => {
  await BlogModel.findByIdAndDelete(req.params.id);
  return res.json(
    buildJsonResponse({
      message: "Deleted successfully",
    }),
  );
};

// Update Status
export const updateStatus = async (req: Request, res: Response) => {
  const { status } = req.body;

  const blog = await BlogModel.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true },
  );

  return res.json(
    buildJsonResponse({
      message: "Blog status updated successfully",
      data: blog,
    }),
  );
};
