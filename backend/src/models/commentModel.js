// src/models/commentModel.js
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
      maxlength: [500, "Comment cannot exceed 500 characters"]
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    userImage: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Index for better performance
commentSchema.index({ job: 1, createdAt: -1 });

export default mongoose.model("Comment", commentSchema);