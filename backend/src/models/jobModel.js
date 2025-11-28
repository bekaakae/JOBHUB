// src/models/jobModel.js
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"]
    },
    description: { 
      type: String, 
      required: [true, "Job description is required"],
      minlength: [50, "Description must be at least 50 characters"]
    },
    company: { 
      type: String, 
      required: [true, "Company name is required"],
      trim: true
    },
    location: { 
      type: String, 
      required: [true, "Location is required"] 
    },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "remote", "any"],
      required: true
    },
    experienceLevel: {
      type: String,
      enum: ["entry", "mid", "senior", "executive", "internship", "any"],
      required: true
    },
    deadline: { 
      type: Date, 
      required: [true, "Application deadline is required"],
      validate: {
        validator: function(value) {
          return value > new Date();
        },
        message: "Deadline must be in the future"
      }
    },
    category: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Category", 
      required: true 
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    applicationLink: { 
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true; // Optional
          return /^https?:\/\/.+\..+/.test(v);
        },
        message: "Please provide a valid URL"
      }
    },
    hrEmail: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true; // Optional
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please provide a valid email address"
      }
    },
    image: {
      url: { type: String },
      publicId: { type: String }
    },
    requirements: [String],
    tags: [String],
    isActive: {
      type: Boolean,
      default: true
    },
    views: {
      type: Number,
      default: 0
    },
    applicationCount: {
      type: Number,
      default: 0
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for likes count
jobSchema.virtual('likesCount', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'job',
  count: true
});

// Virtual for comments count
jobSchema.virtual('commentsCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'job',
  count: true
});

// Add this method to your jobSchema
jobSchema.statics.updateLikeCount = async function(jobId) {
  const likeCount = await this.model('Like').countDocuments({ job: jobId });
  await this.findByIdAndUpdate(jobId, { $set: { likeCount } });
};

// Virtual for checking if deadline is approaching (2 days)
jobSchema.virtual('isDeadlineApproaching').get(function() {
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
  return this.deadline <= twoDaysFromNow && this.deadline > new Date();
});

// In your jobModel.js - improve the custom validation
jobSchema.pre('validate', function(next) {
  // Check if both are missing or both are empty strings
  const hasApplicationLink = this.applicationLink && this.applicationLink.trim() !== '';
  const hasHrEmail = this.hrEmail && this.hrEmail.trim() !== '';
  
  if (!hasApplicationLink && !hasHrEmail) {
    const error = new Error('Either application link or HR email must be provided');
    this.invalidate('applicationLink', error.message);
    this.invalidate('hrEmail', error.message);
  }
  next();
});

// Index for better query performance
jobSchema.index({ category: 1, createdAt: -1 });
jobSchema.index({ deadline: 1 });
jobSchema.index({ isActive: 1 });

// Pre-save middleware to update application count
jobSchema.pre('save', function(next) {
  if (this.isModified('applicationCount')) {
    this.applicationCount = Math.max(0, this.applicationCount);
  }
  next();
});

export default mongoose.model("Job", jobSchema);