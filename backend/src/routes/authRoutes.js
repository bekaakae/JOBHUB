// src/routes/authRoutes.js
import express from "express";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Sync user endpoint
router.post("/sync", protect, (req, res) => {
  try {
    // User is already created by protect middleware
    res.json({
      success: true,
      data: req.user,
      message: "User synced successfully"
    });
  } catch (error) {
    console.error('Sync user error:', error);
    res.status(500).json({
      success: false,
      message: "Error syncing user"
    });
  }
});

// Get current user endpoint
router.get("/me", protect, (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching user data"
    });
  }
});

export default router;