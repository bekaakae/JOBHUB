// src/middleware/adminMiddleware.js - ENHANCED VERSION
import { getAuth, clerkClient } from "@clerk/express";
import User from "../models/userModel.js";

const admin = async (req, res, next) => {
  try {
    console.log('🔐 Admin Middleware - Checking admin access...');
    
    const { userId } = getAuth(req);
    
    if (!userId) {
      console.log('❌ No user ID found in request');
      return res.status(401).json({ 
        success: false,
        message: "Authentication required" 
      });
    }

    // Find user in database
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      console.log(`❌ User not found in database for Clerk ID: ${userId}`);
      
      // Try to create user on the fly
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        
        // Check for admin users (add your Clerk user IDs here)
        const adminClerkIds = [
          "user_35yANDeI7IqVMt1pIA2ILe12yh0" // Add your actual Clerk user ID
        ];
        
        const role = adminClerkIds.includes(userId) ? "admin" : "user";
        
        user = await User.create({
          clerkId: userId,
          name: clerkUser.firstName 
            ? `${clerkUser.firstName}${clerkUser.lastName ? ' ' + clerkUser.lastName : ''}`
            : clerkUser.username || "User",
          email: clerkUser.emailAddresses?.[0]?.emailAddress || null,
          profileImage: clerkUser.imageUrl || null,
          role: role
        });
        
        console.log(`✅ Created user on the fly: ${user.name} - Role: ${user.role}`);
      } catch (createError) {
        console.error('❌ Failed to create user:', createError);
        return res.status(403).json({ 
          success: false,
          message: "User not found and cannot be created" 
        });
      }
    }

    console.log(`👤 User found: ${user.name}, Role: ${user.role}, ID: ${user._id}`);

    // Check if user is admin
    if (user.role !== "admin") {
      console.log(`❌ User ${user.name} is not admin. Role: ${user.role}`);
      
      // Check for temporary admin access (from frontend)
      const tempAdmin = req.headers['x-temp-admin'] === 'true';
      if (tempAdmin) {
        console.log('✅ Temporary admin access granted via header');
        req.user = user;
        return next();
      }
      
      return res.status(403).json({ 
        success: false,
        message: "Admin access only",
        userRole: user.role,
        userId: user.clerkId
      });
    }

    console.log(`✅ Admin access granted for: ${user.name}`);
    req.user = user;
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