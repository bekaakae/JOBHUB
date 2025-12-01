// src/controllers/commentController.js
import Comment from '../models/commentModel.js';
import Job from '../models/jobModel.js';

export const createComment = async (req, res) => {
  try {
    const { content, jobId } = req.body;
    const userId = req.user._id;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    // Create comment with user info
    const comment = await Comment.create({
      content,
      job: jobId,
      user: userId,
      userName: req.user.name,
      userImage: req.user.profileImage
    });

    // Populate user data
    await comment.populate('user', 'name profileImage');

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const getCommentsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const comments = await Comment.find({ job: jobId })
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: comments,
      count: comments.length
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Check if user owns the comment or is admin
    if (comment.user.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment"
      });
    }

    await Comment.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Comment deleted"
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};