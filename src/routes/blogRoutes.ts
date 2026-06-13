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
import { uploadImage } from "../controllers/cloudinaryController.js";
import { adminAuth } from "../middlewares/authMiddleware.js";
import upload from "../configs/multer.js";

const router: Router = express.Router();

// Admin
router.get("/admin", adminAuth, getAllBlogsAdmin);
router.post("/admin/blog", adminAuth, createBlog);
router.put("/admin/blog/:id", adminAuth, updateBlog);
router.delete("/admin/blog/:id", adminAuth, deleteBlog);
router.patch("/admin/blog/:id/status", adminAuth, updateStatus);
router.post(
  "/admin/blog/upload/image",
  adminAuth,
  upload.single("file"),
  uploadImage,
);

// Public
router.get("/", getBlogs);
router.get("/:slug", getBlogBySlug);

export default router;
