// src/routes/commentRoutes.js
import express from "express";
import {
  createComment,
  getCommentsByJob,
  deleteComment
} from "../controllers/commentController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, createComment);

router.route("/job/:jobId")
  .get(getCommentsByJob);

router.route("/:id")
  .delete(protect, deleteComment);

export default router;