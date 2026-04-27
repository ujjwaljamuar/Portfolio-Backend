import express, { Router } from "express";

import {
  createBlog,
  getBlogs,
  getBlogBySlug,
  getAllBlogsAdmin,
  updateBlog,
  deleteBlog,
  updateStatus,
} from "../controllers/blogController.js";
import { adminAuth } from "../middlewares/authMiddleware.js";

const router: Router = express.Router();

// Admin
router.get("/admin", adminAuth, getAllBlogsAdmin);
router.post("/admin/blog", adminAuth, createBlog);
router.put("/admin/blog/:id", adminAuth, updateBlog);
router.delete("/admin/blog/:id", adminAuth, deleteBlog);
router.patch("/admin/blog/:id/status", adminAuth, updateStatus);

// Public
router.get("/", getBlogs);
router.get("/:slug", getBlogBySlug);

export default router;
