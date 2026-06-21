import express, { Router } from "express";

import {
  createDsaProblem,
  deleteDsaProblem,
  getDsaProblemById,
  getDsaProblems,
  getDsaStats,
  reviseDsaProblem,
  searchDsaProblems,
  updateDsaProblem,
  updateDsaStatus,
} from "../controllers/dsaController.js";
import { adminAuth } from "../middlewares/authMiddleware.js";

const router: Router = express.Router();

router.post("/", adminAuth, createDsaProblem);
router.get("/", adminAuth, getDsaProblems);
router.get("/search", adminAuth, searchDsaProblems);
router.get("/stats", adminAuth, getDsaStats);
router.get("/:id", adminAuth, getDsaProblemById);
router.put("/:id", adminAuth, updateDsaProblem);
router.delete("/:id", adminAuth, deleteDsaProblem);
router.patch("/:id/status", adminAuth, updateDsaStatus);
router.post("/:id/revise", adminAuth, reviseDsaProblem);

export default router;
