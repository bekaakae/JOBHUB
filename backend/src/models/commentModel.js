// src/models/commentModel.js
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
      maxlength: [500, "Comment cannot exceed 500 characters"]
    },
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
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

commentSchema.index({ job: 1, createdAt: -1 });

export default mongoose.model("Comment", commentSchema);