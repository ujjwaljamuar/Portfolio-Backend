import express, { Router } from "express";
import {
  getContactDataCSV,
  saveContactInfo,
} from "../controllers/contactController.js";

const router: Router = express.Router();

router.post("/save", saveContactInfo);
router.get("/csv", getContactDataCSV);

export default router;
