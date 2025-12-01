// src/controllers/likeController.js
import Like from '../models/likeModel.js';
import Job from '../models/jobModel.js';

export const toggleLike = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.user._id;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    // Check if user already liked the job
    const existingLike = await Like.findOne({
      user: userId,
      job: jobId
    });

    if (existingLike) {
      // Unlike
      await Like.findByIdAndDelete(existingLike._id);
      res.json({
        success: true,
        liked: false,
        message: "Like removed"
      });
    } else {
      // Like
      const like = await Like.create({
        user: userId,
        job: jobId
      });
      
      res.json({
        success: true,
        liked: true,
        message: "Like added"
      });
    }
  } catch (error) {
    console.error("Like toggle error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const getLikesByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const likes = await Like.find({ job: jobId })
      .populate('user', 'name profileImage')
      .lean();

    res.json({
      success: true,
      data: likes,
      count: likes.length
    });
  } catch (error) {
    console.error("Get likes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const checkUserLike = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;

    const like = await Like.findOne({
      user: userId,
      job: jobId
    });

    res.json({
      success: true,
      liked: !!like
    });
  } catch (error) {
    console.error("Check like error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};