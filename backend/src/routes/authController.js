// src/controllers/authController.js
import User from "../models/userModel.js";
import { getAuth } from "@clerk/express";

export const createProfile = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Not authenticated" 
      });
    }

    const { name, email } = req.body;

    let user = await User.findOne({ clerkId: userId });
    if (user) {
      return res.json({
        success: true,
        data: user
      });
    }

    user = await User.create({
      clerkId: userId,
      name: name || "No Name",
      email: email,
      role: ["user_2h9J7x8X8Q8X8X8X8X8X8X8", "user_2h9J7x8X8Q8X8X8X8X8X9"].includes(userId) ? "admin" : "user"
    });

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Create profile error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while creating profile",
      error: error.message 
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Not authenticated" 
      });
    }

    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User profile not found" 
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching profile",
      error: error.message 
    });
  }
};