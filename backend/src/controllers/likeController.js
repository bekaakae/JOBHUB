import Like from "../models/likeModel.js";
import Job from "../models/jobModel.js";

// @desc    Toggle like on a job
// @route   POST /api/likes/toggle
// @access  Private
export const toggleLike = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required"
      });
    }

    // Check if job exists and is active
    const job = await Job.findOne({ _id: jobId, isActive: true });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    // Check if user already liked the job
    const existingLike = await Like.findOne({
      user: req.user?._id || req.user?.clerkId,
      job: jobId
    });

    let userHasLiked;
    let likesCount;

    if (existingLike) {
      // Unlike: remove the like
      await Like.findByIdAndDelete(existingLike._id);
      userHasLiked = false;
      
      // Get updated likes count
      likesCount = await Like.countDocuments({ job: jobId });
    } else {
      // Like: create new like
      await Like.create({
        user: req.user?._id || req.user?.clerkId,
        job: jobId
      });
      
      userHasLiked = true;
      likesCount = await Like.countDocuments({ job: jobId });
    }

    res.json({
      success: true,
      data: {
        userHasLiked,
        likesCount
      }
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while toggling like",
      error: error.message
    });
  }
};

// @desc    Get likes for a job
// @route   GET /api/likes/job/:jobId
// @access  Public
export const getLikesByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const likesCount = await Like.countDocuments({ job: jobId });
    
    // Check if current user has liked the job
    let userHasLiked = false;
    if (req.user) {
      const userLike = await Like.findOne({
        user: req.user?._id || req.user?.clerkId,
        job: jobId
      });
      userHasLiked = !!userLike;
    }

    res.json({
      success: true,
      data: {
        likesCount,
        userHasLiked
      }
    });
  } catch (error) {
    console.error("Get likes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching likes",
      error: error.message
    });
  }
};

// @desc    Check if user liked a job
// @route   GET /api/likes/job/:jobId/check
// @access  Private
export const checkUserLike = async (req, res) => {
  try {
    const { jobId } = req.params;

    const userLike = await Like.findOne({
      user: req.user?._id || req.user?.clerkId,
      job: jobId
    });

    res.json({
      success: true,
      data: {
        userHasLiked: !!userLike
      }
    });
  } catch (error) {
    console.error("Check user like error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while checking like",
      error: error.message
    });
  }
};