// src/config/db.js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.error("❌ MONGO_URI is not defined in environment variables");
      console.log("Available environment variables:", Object.keys(process.env).filter(key => key.includes('MONGO')));
      process.exit(1);
    }

    console.log("🔗 Attempting to connect to MongoDB...");
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.log("💡 Tips:");
    console.log("1. Check if MONGO_URI is set in Render environment variables");
    console.log("2. Verify MongoDB connection string format");
    console.log("3. Ensure IP is whitelisted in MongoDB Atlas");
    console.log("4. Check database user permissions");
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

export default connectDB;