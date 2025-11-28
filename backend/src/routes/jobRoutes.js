// src/routes/jobRoutes.js - FIXED VERSION
import express from "express";
import {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  getJobsByCategory
} from "../controllers/jobController.js";
import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getJobs);
router.get("/:id", getJob);
router.get("/category/:categoryId", getJobsByCategory);

// Protected admin routes
router.post("/", protect, admin, createJob);
router.put("/:id", protect, admin, updateJob);
router.delete("/:id", protect, admin, deleteJob);

export default router;