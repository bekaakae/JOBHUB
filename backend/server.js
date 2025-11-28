// server.js - DEBUGGED VERSION
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { clerkMiddleware } from "@clerk/express";

// Get current directory for absolute paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 Starting server initialization...');
console.log('Current directory:', __dirname);

// Initialize variables for imported modules
let connectDB, authRoutes, categoryRoutes, jobRoutes, applicationRoutes, commentRoutes, likeRoutes;

// Function to safely import modules
const safeImport = async (modulePath, moduleName) => {
  try {
    console.log(`📦 Attempting to import ${moduleName} from: ${modulePath}`);
    const module = await import(modulePath);
    console.log(`✅ Successfully imported ${moduleName}`);
    return module.default || module;
  } catch (error) {
    console.error(`❌ Failed to import ${moduleName}:`, error.message);
    console.log(`   Full path: ${join(__dirname, modulePath)}`);
    return null;
  }
};

// Main initialization function
const initializeServer = async () => {
  console.log('\n🚀 Initializing server modules...');

  // Import database configuration
  connectDB = await safeImport('./src/config/db.js', 'Database Config');
  if (!connectDB) {
    console.error('❌ Cannot start server without database connection');
    process.exit(1);
  }

  // Import routes
  authRoutes = await safeImport('./src/routes/authRoutes.js', 'Auth Routes');
  categoryRoutes = await safeImport('./src/routes/categoryRoutes.js', 'Category Routes');
  jobRoutes = await safeImport('./src/routes/jobRoutes.js', 'Job Routes');
  applicationRoutes = await safeImport('./src/routes/applicationRoutes.js', 'Application Routes');
  commentRoutes = await safeImport('./src/routes/commentRoutes.js', 'Comment Routes');
  likeRoutes = await safeImport('./src/routes/likeRoutes.js', 'Like Routes');

  console.log('\n📊 Import Summary:');
  console.log(`   ✅ Database: ${connectDB ? 'Loaded' : 'Failed'}`);
  console.log(`   ✅ Auth Routes: ${authRoutes ? 'Loaded' : 'Failed'}`);
  console.log(`   ✅ Category Routes: ${categoryRoutes ? 'Loaded' : 'Failed'}`);
  console.log(`   ✅ Job Routes: ${jobRoutes ? 'Loaded' : 'Failed'}`);
  console.log(`   ✅ Application Routes: ${applicationRoutes ? 'Loaded' : 'Failed'}`);
  console.log(`   ✅ Comment Routes: ${commentRoutes ? 'Loaded' : 'Failed'}`);
  console.log(`   ✅ Like Routes: ${likeRoutes ? 'Loaded' : 'Failed'}`);

  // Check if we have minimum required modules
  const requiredModules = [connectDB, authRoutes, categoryRoutes, jobRoutes];
  const missingRequired = requiredModules.filter(module => !module);
  
  if (missingRequired.length > 0) {
    console.error('❌ Missing required modules. Server cannot start.');
    process.exit(1);
  }

  // Initialize Express and database
  dotenv.config();
  
  try {
    await connectDB();
    console.log('✅ Database connected successfully');
  } catch (dbError) {
    console.error('❌ Database connection failed:', dbError.message);
    process.exit(1);
  }

  const app = express();
  const httpServer = createServer(app);
  
  // Enhanced CORS configuration
  app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-temp-admin', 'x-admin-auth' ] // ADDED x-temp-admin]
  }));

  // Socket.io configuration - FIXED
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization", 'x-temp-admin', 'x-admin-auth' ] // ADDED x-temp-admin]
    },
    transports: ['websocket', 'polling']
  });

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  });
  app.use(limiter);

  // Security middleware
  app.use(helmet());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Clerk middleware
  app.use(clerkMiddleware());

  // Socket.io for real-time features
  io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);
    
    socket.on('join-job-room', (jobId) => {
      socket.join(`job-${jobId}`);
      console.log(`User ${socket.id} joined job room: job-${jobId}`);
    });

    socket.on('new-comment', (data) => {
      socket.to(`job-${data.jobId}`).emit('comment-added', data);
    });

    socket.on('new-like', (data) => {
      socket.to(`job-${data.jobId}`).emit('like-updated', data);
    });

    socket.on('disconnect', () => {
      console.log('🔌 User disconnected:', socket.id);
    });
  });

  app.use((req, res, next) => {
    req.io = io;
    next();
  });

  // Routes with fallbacks for missing modules
  console.log('\n🌐 Setting up routes...');
  
  if (authRoutes) {
    app.use("/api/auth", authRoutes);
    console.log('   ✅ Auth routes mounted');
  }

  if (categoryRoutes) {
    app.use("/api/categories", categoryRoutes);
    console.log('   ✅ Category routes mounted');
  }

  if (jobRoutes) {
    app.use("/api/jobs", jobRoutes);
    console.log('   ✅ Job routes mounted');
  }

  if (applicationRoutes) {
    app.use("/api/applications", applicationRoutes);
    console.log('   ✅ Application routes mounted');
  } else {
    // Fallback for missing application routes
    app.use("/api/applications", (req, res) => {
      res.status(501).json({ message: "Applications feature not implemented yet" });
    });
  }

  if (commentRoutes) {
    app.use("/api/comments", commentRoutes);
    console.log('   ✅ Comment routes mounted');
  } else {
    // Fallback for missing comment routes
    app.use("/api/comments", (req, res) => {
      res.status(501).json({ message: "Comments feature not implemented yet" });
    });
  }

  if (likeRoutes) {
    app.use("/api/likes", likeRoutes);
    console.log('   ✅ Like routes mounted');
  } else {
    // Fallback for missing like routes
    app.use("/api/likes", (req, res) => {
      res.status(501).json({ message: "Likes feature not implemented yet" });
    });
  }

  // Health check
  app.get("/api/health", (req, res) => {
    res.status(200).json({ 
      status: "OK", 
      message: "JobHub API is running",
      timestamp: new Date().toISOString(),
      routes: {
        auth: !!authRoutes,
        categories: !!categoryRoutes,
        jobs: !!jobRoutes,
        applications: !!applicationRoutes,
        comments: !!commentRoutes,
        likes: !!likeRoutes
      }
    });
  });

  // Test routes for debugging
  app.get("/api/debug/routes", (req, res) => {
    res.json({
      availableRoutes: [
        "/api/health",
        "/api/auth/*",
        "/api/categories/*",
        "/api/jobs/*",
        "/api/applications/*",
        "/api/comments/*", 
        "/api/likes/*"
      ],
      loadedModules: {
        authRoutes: !!authRoutes,
        categoryRoutes: !!categoryRoutes,
        jobRoutes: !!jobRoutes,
        applicationRoutes: !!applicationRoutes,
        commentRoutes: !!commentRoutes,
        likeRoutes: !!likeRoutes
      }
    });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('💥 Server error:', err.stack);
    res.status(500).json({ 
      message: "Something went wrong!",
      error: process.env.NODE_ENV === 'production' ? {} : err.message 
    });
  });

  // 404 handler
  app.use("*", (req, res) => {
    res.status(404).json({ 
      message: "API route not found",
      availableRoutes: [
        "GET /api/health",
        "GET /api/debug/routes", 
        "GET/POST /api/auth/*",
        "GET/POST /api/categories/*",
        "GET/POST /api/jobs/*"
      ]
    });
  });

  const PORT = process.env.PORT || 5000;

  httpServer.listen(PORT, () => {
    console.log('\n🎉 ==================================');
    console.log(`🚀 JobHub Server is running!`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🐛 Debug info: http://localhost:${PORT}/api/debug/routes`);
    console.log('====================================\n');
  });

  return { app, io };
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
initializeServer().catch((error) => {
  console.error('💥 Failed to initialize server:', error);
  process.exit(1);
});

export { initializeServer };