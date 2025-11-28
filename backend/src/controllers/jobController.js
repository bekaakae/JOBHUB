import Job from "../models/jobModel.js";
import Category from "../models/categoryModel.js";
import Application from "../models/applicationModel.js";
import Like from "../models/likeModel.js";
import Comment from "../models/commentModel.js";

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private/Admin
const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      company,
      location,
      jobType,
      experienceLevel,
      deadline,
      category,
      applicationLink,
      hrEmail,
      requirements,
      benefits,
      tags
    } = req.body;

    // FIX: Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: "User not authenticated" 
      });
    }

    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ 
        success: false,
        message: "Category not found" 
      });
    }

    // Validate that at least one contact method is provided
    if (!applicationLink && !hrEmail) {
      return res.status(400).json({
        success: false,
        message: "Either application link or HR email must be provided"
      });
    }

    const job = await Job.create({
      title,
      description,
      company,
      location,
      jobType,
      experienceLevel,
      deadline,
      category,
      applicationLink: applicationLink || undefined,
      hrEmail: hrEmail || undefined,
      requirements: requirements || [],
      benefits: benefits || [],
      tags: tags || [],
      createdBy: req.user._id
    });

    // Update category job count
    await categoryExists.updateJobCount();

    // Populate the created job
    const populatedJob = await Job.findById(job._id)
      .populate("category", "name color")
      .populate("createdBy", "name");

    res.status(201).json({
      success: true,
      data: populatedJob
    });
  } catch (error) {
    console.error("Create job error:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Server error while creating job",
      error: error.message 
    });
  }
};

// @desc    Get all jobs with filtering and pagination
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
  try {
    const {
      search,
      category,
      location,
      jobType,
      experienceLevel,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    let query = { isActive: true };

    // Search in title, description, company
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } }
      ];
    }

    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: "i" };
    if (jobType) query.jobType = jobType;
    if (experienceLevel) query.experienceLevel = experienceLevel;

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate("category", "name color")
      .populate("createdBy", "name")
      .sort(sortConfig)
      .skip(skip)
      .limit(pageSize)
      .lean();

    // Add virtual fields
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const [likesCount, commentsCount, applicationsCount] = await Promise.all([
          Like.countDocuments({ job: job._id }),
          Comment.countDocuments({ job: job._id, isActive: true }),
          Application.countDocuments({ job: job._id })
        ]);

        return {
          ...job,
          likesCount,
          commentsCount,
          applicationsCount,
          isDeadlineApproaching: new Date(job.deadline) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        };
      })
    );

    // FIXED: Changed 'jobsWithdDetails' to 'jobsWithCounts'
    res.json({
      success: true,
      data: jobsWithCounts, // ← THIS WAS THE TYPO!
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error("Get jobs error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching jobs",
      error: error.message 
    });
  }
};

// @desc    Get jobs with deadline approaching (for blinking feature)
// @route   GET /api/jobs/urgent
// @access  Public
const getUrgentJobs = async (req, res) => {
  try {
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    
    const jobs = await Job.find({
      deadline: { 
        $lte: twoDaysFromNow,
        $gte: new Date()
      },
      isActive: true
    })
    .populate("category", "name color")
    .populate("createdBy", "name")
    .sort({ deadline: 1 });

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error("Get urgent jobs error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching urgent jobs",
      error: error.message 
    });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
const getJob = async (req, res) => {
  try {
    // Validate job ID
    if (!req.params.id || req.params.id === 'undefined') {
      return res.status(400).json({ 
        success: false,
        message: "Job ID is required" 
      });
    }

    const job = await Job.findById(req.params.id)
      .populate("category", "name color description")
      .populate("createdBy", "name")
      .lean();

    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: "Job not found" 
      });
    }

    if (!job.isActive) {
      return res.status(404).json({ 
        success: false,
        message: "Job has been removed" 
      });
    }

    // Increment views
    await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // Get counts and user interaction
    const [likesCount, commentsCount, applicationsCount] = await Promise.all([
      Like.countDocuments({ job: job._id }),
      Comment.countDocuments({ job: job._id, isActive: true }),
      Application.countDocuments({ job: job._id })
    ]);

    // Check if user has liked the job
    let userHasLiked = false;
    let userHasApplied = false;
    
    if (req.user) {
      const [userLike, userApplication] = await Promise.all([
        Like.findOne({ 
          job: job._id, 
          user: req.user?._id || req.user?.clerkId 
        }),
        Application.findOne({ 
          job: job._id, 
          user: req.user?._id || req.user?.clerkId 
        })
      ]);
      userHasLiked = !!userLike;
      userHasApplied = !!userApplication;
    }

    const jobWithDetails = {
      ...job,
      likesCount,
      commentsCount,
      applicationsCount,
      isDeadlineApproaching: new Date(job.deadline) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      userHasLiked,
      userHasApplied
    };

    res.json({
      success: true,
      data: jobWithDetails
    });
  } catch (error) {
    console.error("Get job error:", error);
    
    // Handle invalid ID format
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: "Invalid job ID format" 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching job",
      error: error.message 
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private/Admin
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: "Job not found" 
      });
    }

    // Check if user is the creator or admin
    if (job.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to update this job" 
      });
    }

    // Validate that at least one contact method is provided in update
    if (req.body.applicationLink === null && req.body.hrEmail === null) {
      return res.status(400).json({
        message: "Either application link or HR email must be provided"
      });
    }

    // Prepare update data
    const updateData = { ...req.body };
    
    // Handle applicationLink and hrEmail properly for validation
    if (updateData.applicationLink === null) updateData.applicationLink = undefined;
    if (updateData.hrEmail === null) updateData.hrEmail = undefined;

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    ).populate("category", "name color")
     .populate("createdBy", "name");

    res.json({
      success: true,
      data: updatedJob
    });
  } catch (error) {
    console.error("Update job error:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Server error while updating job",
      error: error.message 
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private/Admin
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: "Job not found" 
      });
    }

    // Check if user is the creator or admin
    if (job.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to delete this job" 
      });
    }

    // Soft delete
    job.isActive = false;
    await job.save();

    // Update category job count
    await Category.findByIdAndUpdate(job.category, { $inc: { jobCount: -1 } });

    res.json({
      success: true,
      message: "Job deleted successfully"
    });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while deleting job",
      error: error.message 
    });
  }
};

// @desc    Get jobs by category
// @route   GET /api/jobs/category/:categoryId
// @access  Public
const getJobsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page);
    const pageSize = Number(limit);
    const skip = (pageNumber - 1) * pageSize;

    const query = { 
      category: categoryId, 
      isActive: true 
    };

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate("category", "name color")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const [likesCount, commentsCount] = await Promise.all([
          Like.countDocuments({ job: job._id }),
          Comment.countDocuments({ job: job._id, isActive: true })
        ]);

        return {
          ...job,
          likesCount,
          commentsCount,
          isDeadlineApproaching: new Date(job.deadline) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        };
      })
    );

    res.json({
      success: true,
      data: jobsWithCounts,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error("Get jobs by category error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching jobs by category",
      error: error.message 
    });
  }
};

// Export all functions
export {
  createJob,
  getJobs,
  getUrgentJobs,
  getJob,
  updateJob,
  deleteJob,
  getJobsByCategory
};