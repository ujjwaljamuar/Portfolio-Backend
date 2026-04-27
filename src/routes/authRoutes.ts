import express, { Router } from "express";
import {
  adminLogin,
  adminLogout,
  createAdmin,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router: Router = express.Router();

router.post("/login", adminLogin);
router.post("/logout", adminLogout);
router.post("/setup-admin", createAdmin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
