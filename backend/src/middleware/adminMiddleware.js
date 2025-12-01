// src/middleware/adminMiddleware.js - UPDATED WITH YOUR ID
import User from "../models/userModel.js";

const admin = async (req, res, next) => {
  try {
    console.log('🔐 Admin Middleware - Checking admin access...');
    
    // Check if user is authenticated
    if (!req.user) {
      console.log('❌ No user found in request');
      return res.status(401).json({ 
        success: false,
        message: "Authentication required" 
      });
    }

    console.log(`👤 Checking admin access for: ${req.user.name}, Role: ${req.user.role}, Clerk ID: ${req.user.clerkId}, DB ID: ${req.user._id}`);

    // Your actual Clerk User ID - REPLACE THIS WITH YOUR ACTUAL ID
    const adminClerkIds = [
      "user_35yANDeI7IqVMt1pIA2ILe12yh0", // Your original ID
      // Add your actual Clerk user ID here after checking the console logs
    ];

    // Check if user is admin by role OR by Clerk ID
    const isAdminByRole = req.user.role === "admin";
    const isAdminById = adminClerkIds.includes(req.user.clerkId);
    
    if (!isAdminByRole && !isAdminById) {
      console.log(`❌ User ${req.user.name} is not admin. Role: ${req.user.role}, Clerk ID: ${req.user.clerkId}`);
      
      return res.status(403).json({ 
        success: false,
        message: "Admin access only",
        userRole: req.user.role,
        userId: req.user.clerkId
      });
    }

    // If user is admin by ID but not by role, update their role in database
    if (isAdminById && !isAdminByRole) {
      console.log(`🔄 User ${req.user.name} is admin by ID but not by role. Updating role...`);
      req.user.role = "admin";
      await req.user.save();
    }

    console.log(`✅ Admin access granted for: ${req.user.name}`);
    next();
  } catch (error) {
    console.error("❌ Admin middleware error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error checking admin role",
      error: error.message 
    });
  }
};

export default admin;