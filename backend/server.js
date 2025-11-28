// server.js - FIXED VERSION
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from "mongoose";

// Get current directory for absolute paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 Starting JobHub Server Initialization...');
console.log('📁 Current directory:', __dirname);
console.log('🌐 Node environment:', process.env.NODE_ENV || 'development');

// Load environment variables FIRST
dotenv.config();

// Debug environment variables (safe - no sensitive data exposure)
console.log('🔍 Environment Check:');
console.log('- PORT:', process.env.PORT);
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('- MONGO_URI length:', process.env.MONGO_URI?.length);
console.log('- CLERK_SECRET_KEY exists:', !!process.env.CLERK_SECRET_KEY);
console.log('- CLERK_PUBLISHABLE_KEY exists:', !!process.env.CLERK_PUBLISHABLE_KEY);
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware - applied before routes
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - FIXED: Added all required headers
app.use(cors({
  origin: [
    "https://jobhub-frontend-6e6g.onrender.com",
    "http://localhost:5173"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'x-temp-admin', 
    'x-admin-auth',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Origin'
  ]
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize HTTP server and Socket.io
const httpServer = createServer(app);

// Socket.io configuration - FIXED: Removed invalid allowedHeaders from Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: [
      "https://jobhub-frontend-6e6g.onrender.com",
      "http://localhost:5173"
    ],
    credentials: true,
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  
  socket.on('join-job-room', (jobId) => {
    socket.join(`job-${jobId}`);
    console.log(`User ${socket.id} joined job room: job-${jobId}`);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 User disconnected:', socket.id, 'Reason:', reason);
  });

  socket.on('error', (error) => {
    console.error('🔌 Socket error:', error);
  });
});

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Import and configure Clerk middleware
let clerkMiddleware;
try {
  const clerkModule = await import("@clerk/express");
  clerkMiddleware = clerkModule.clerkMiddleware;
  app.use(clerkMiddleware());
  console.log('✅ Clerk middleware initialized');
} catch (error) {
  console.warn('⚠️ Clerk middleware not available:', error.message);
  console.log('💡 Continuing without authentication middleware');
}

// DATABASE CONNECTION WITH RETRY LOGIC
const connectDB = async (retries = 5, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Database connection attempt ${attempt}/${retries}...`);
      
      const mongoUri = process.env.MONGO_URI;
      
      if (!mongoUri) {
        throw new Error('MONGO_URI is not defined in environment variables');
      }

      console.log('📊 Connecting to MongoDB...');
      
      const conn = await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        retryWrites: true,
        w: 'majority'
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      console.log(`📊 Database: ${conn.connection.name}`);
      return conn;
      
    } catch (error) {
      console.error(`❌ Database connection attempt ${attempt} failed:`, error.message);
      
      if (attempt === retries) {
        console.error('💥 All database connection attempts failed');
        if (process.env.NODE_ENV === 'production') {
          console.log('⚠️ Continuing without database connection for health checks');
          return null;
        } else {
          throw error;
        }
      }
      
      console.log(`⏳ Retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// MongoDB event handlers
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected from MongoDB');
});

// MANUAL ROUTE IMPORT - FIXED: Replace dynamic loading with static imports
console.log('🛣️ Importing routes manually...');

let authRoutes, categoryRoutes, jobRoutes, commentRoutes, likeRoutes, applicationRoutes;

try {
  // Import all routes statically
  authRoutes = (await import("./src/routes/authRoutes.js")).default;
  categoryRoutes = (await import("./src/routes/categoryRoutes.js")).default;
  jobRoutes = (await import("./src/routes/jobRoutes.js")).default;
  commentRoutes = (await import("./src/routes/commentRoutes.js")).default;
  likeRoutes = (await import("./src/routes/likeRoutes.js")).default;
  applicationRoutes = (await import("./src/routes/applicationRoutes.js")).default;
  
  console.log('✅ All routes imported successfully');
} catch (error) {
  console.error('❌ Failed to import routes:', error.message);
  process.exit(1);
}

// MOUNT ROUTES EXPLICITLY - FIXED: Mount routes before health checks
console.log('📌 Mounting routes...');

app.use("/api/auth", authRoutes);
console.log('✅ Auth routes mounted at /api/auth');

app.use("/api/categories", categoryRoutes);
console.log('✅ Category routes mounted at /api/categories');

app.use("/api/jobs", jobRoutes);
console.log('✅ Job routes mounted at /api/jobs');

app.use("/api/comments", commentRoutes);
console.log('✅ Comment routes mounted at /api/comments');

app.use("/api/likes", likeRoutes);
console.log('✅ Like routes mounted at /api/likes');

app.use("/api/applications", applicationRoutes);
console.log('✅ Application routes mounted at /api/applications');

// HEALTH CHECK ENDPOINTS - Now placed AFTER API routes
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "JobHub API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    version: "1.0.0"
  });
});

app.get("/", (req, res) => {
  res.json({ 
    message: "JobHub Backend API", 
    version: "1.0.0",
    status: "Operational",
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: "GET /api/health",
      debug: "GET /api/debug",
      categories: "GET /api/categories",
      jobs: "GET /api/jobs",
      api: "Available at /api/*"
    }
  });
});

// DEBUG ENDPOINT - Safe environment info
app.get("/api/debug", (req, res) => {
  res.json({
    server: {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV
    },
    database: {
      status: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
      readyState: mongoose.connection.readyState
    },
    environment: {
      port: process.env.PORT,
      frontendUrl: process.env.FRONTEND_URL,
      mongoUriExists: !!process.env.MONGO_URI,
      mongoUriLength: process.env.MONGO_URI?.length,
      clerkKeysExist: !!process.env.CLERK_SECRET_KEY && !!process.env.CLERK_PUBLISHABLE_KEY
    },
    routes: {
      health: "GET /api/health",
      auth: "POST/GET /api/auth/*",
      categories: "GET /api/categories/*", 
      jobs: "GET/POST /api/jobs/*",
      comments: "GET/POST /api/comments/*",
      likes: "POST /api/likes/*"
    }
  });
});

// ROUTE DEBUG ENDPOINT - NEW: Test if routes are working
app.get("/api/debug-routes", async (req, res) => {
  try {
    // Test if we can access database through models
    const Category = (await import("./src/models/categoryModel.js")).default;
    const Job = (await import("./src/models/jobModel.js")).default;
    
    const categoriesCount = await Category.countDocuments();
    const jobsCount = await Job.countDocuments();
    
    res.json({
      message: "Route Debug Information",
      routes: {
        categories: {
          path: "/api/categories",
          mounted: true,
          database: {
            count: categoriesCount,
            status: categoriesCount > 0 ? "Has Data" : "Empty"
          }
        },
        jobs: {
          path: "/api/jobs", 
          mounted: true,
          database: {
            count: jobsCount,
            status: jobsCount > 0 ? "Has Data" : "Empty"
          }
        }
      },
      database: {
        connected: mongoose.connection.readyState === 1,
        state: mongoose.connection.readyState
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Debug route failed",
      error: error.message
    });
  }
});

// ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // Default error
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    success: false,
    message: isProduction ? 'Internal server error' : err.message,
    ...(!isProduction && { stack: err.stack })
  });
});

// 404 HANDLER - Must be last
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/debug',
      'GET /api/debug-routes',
      'GET /api/categories',
      'GET /api/jobs',
      'POST /api/auth/*',
      'POST /api/comments',
      'POST /api/likes/toggle'
    ]
  });
});

// SERVER STARTUP FUNCTION
const startServer = async () => {
  try {
    console.log('\n🚀 Starting JobHub Server...');
    
    // Step 1: Connect to database
    console.log('📊 Initializing database connection...');
    const dbConnection = await connectDB();
    
    if (!dbConnection && process.env.NODE_ENV === 'production') {
      console.log('⚠️ Starting in limited mode - database unavailable');
    }

    // Step 3: Start HTTP server
    httpServer.listen(PORT, () => {
      console.log('\n🎉 ==========================================');
      console.log(`🚀 JobHub Server STARTED SUCCESSFULLY!`);
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Database: ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ⚠️'}`);
      console.log(`🛣️  Routes: 6 modules mounted`);
      console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
      console.log(`🐛 Debug: http://localhost:${PORT}/api/debug`);
      console.log(`🔧 Route Test: http://localhost:${PORT}/api/debug-routes`);
      console.log('==========================================\n');
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal) => {
      console.log(`\n⚠️ Received ${signal}, shutting down gracefully...`);
      
      httpServer.close(async () => {
        console.log('✅ HTTP server closed');
        
        if (mongoose.connection.readyState === 1) {
          await mongoose.connection.close();
          console.log('✅ MongoDB connection closed');
        }
        
        console.log('👋 Server shutdown complete');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('💥 Forcing server shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('💥 CRITICAL: Failed to start server:', error);
    process.exit(1);
  }
};

// UNCAUGHT EXCEPTION HANDLERS
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION at:', promise, 'reason:', reason);
  process.exit(1);
});

// START THE SERVER
startServer();

export { app, io, mongoose };