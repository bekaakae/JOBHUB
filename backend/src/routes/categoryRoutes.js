// src/routes/categoryRoutes.js
import express from "express";
import { createCategory, getCategories, updateCategory, deleteCategory } from "../controllers/categoryController.js";
import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, admin, createCategory)
  .get(getCategories);

router.route("/:id")
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

export default router;