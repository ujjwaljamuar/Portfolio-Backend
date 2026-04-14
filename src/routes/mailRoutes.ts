import express, { Router } from "express";
import { sendEmailNotificationHandler } from "../controllers/emailController.js";

const router: Router = express.Router();

router.post("/send", sendEmailNotificationHandler);

export default router;
