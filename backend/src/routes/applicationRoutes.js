// src/routes/applicationRoutes.js
import express from "express";
import {
  createApplication,
  getApplicationsByJob,
  getApplicationsByUser,
  updateApplicationStatus
} from "../controllers/applicationController.js";
import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", protect, createApplication);
router.get("/job/:jobId", protect, admin, getApplicationsByJob);
router.get("/my-applications", protect, getApplicationsByUser);
router.put("/:id/status", protect, admin, updateApplicationStatus);

export default router;