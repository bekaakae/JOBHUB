// src/middleware/authMiddleware.js - UPDATED VERSION
import { getAuth, clerkClient } from "@clerk/express";
import User from "../models/userModel.js";

const protect = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      // No user ID found - user is not authenticated
      req.user = null;
      return next();
    }

    // Find user in database
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      // Create user if doesn't exist with proper user data from Clerk
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        
        // Define your actual admin user IDs here
        const adminClerkIds = [
          "user_35yANDeI7IqVMt1pIA2ILe12yh0", // Your original ID
          // Add your actual Clerk user ID here
        ];
        
        // Set role based on actual admin IDs, otherwise 'user'
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
        
        console.log(`✅ Created new user: ${user.name} - Role: ${user.role} - Clerk ID: ${user.clerkId}`);
      } catch (createError) {
        console.error('❌ Failed to create user:', createError);
        req.user = null;
        return next();
      }
    } else {
      console.log(`👤 User found: ${user.name} - Role: ${user.role} - Clerk ID: ${user.clerkId}`);
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    
    // Allow public access even if auth fails, but no user
    req.user = null;
    next();
  }
};

export default protect;