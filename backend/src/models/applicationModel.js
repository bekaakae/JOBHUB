// src/models/applicationModel.js
import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Compound index to ensure one application per user per job
applicationSchema.index({ job: 1, user: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);