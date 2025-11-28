// src/controllers/commentController.js
import Comment from "../models/commentModel.js";
import Job from "../models/jobModel.js";

// @desc    Create a comment
// @route   POST /api/comments
// @access  Private
export const createComment = async (req, res) => {
  try {
    const { content, jobId } = req.body;

    // Validate job exists and is active
    const job = await Job.findOne({ _id: jobId, isActive: true });
    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: "Job not found" 
      });
    }

    const comment = await Comment.create({
      content,
      job: jobId,
      user: req.user._id
    });

    // Populate user details
    await comment.populate("user", "name profileImage");

    // Emit real-time update
    if (req.io) {
      req.io.to(`job-${jobId}`).emit("comment-added", {
        comment: comment,
        jobId: jobId
      });
    }

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while creating comment",
      error: error.message 
    });
  }
};

// @desc    Get comments for a job
// @route   GET /api/comments/job/:jobId
// @access  Public
export const getCommentsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page);
    const pageSize = Number(limit);
    const skip = (pageNumber - 1) * pageSize;

    const query = { 
      job: jobId, 
      isActive: true 
    };

    const total = await Comment.countDocuments(query);
    const comments = await Comment.find(query)
      .populate("user", "name profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    res.json({
      success: true,
      data: comments,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching comments",
      error: error.message 
    });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ 
        success: false,
        message: "Comment not found" 
      });
    }

    // Check if user is the comment author or admin
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to delete this comment" 
      });
    }

    // Soft delete
    comment.isActive = false;
    await comment.save();

    // Emit real-time update
    if (req.io) {
      req.io.to(`job-${comment.job}`).emit("comment-removed", {
        commentId: comment._id,
        jobId: comment.job
      });
    }

    res.json({
      success: true,
      message: "Comment deleted successfully"
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while deleting comment",
      error: error.message 
    });
  }
};