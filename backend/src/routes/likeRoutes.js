// src/routes/likeRoutes.js
import express from "express";
import {
  toggleLike,
  getLikesByJob,
  checkUserLike
} from "../controllers/likeController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/toggle", protect, toggleLike);
router.get("/job/:jobId", getLikesByJob);
router.get("/job/:jobId/check", protect, checkUserLike);

export default router;