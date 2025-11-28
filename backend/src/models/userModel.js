// src/models/userModel.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: { 
      type: String, 
      unique: true, 
      sparse: true,
      required: true,
      index: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      unique: true, 
      sparse: true 
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    profileImage: {
      type: String
    },
    preferences: {
      categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
      jobTypes: [String],
      locations: [String]
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for user's applications
userSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'user'
});

export default mongoose.model("User", userSchema);