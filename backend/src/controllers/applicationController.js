// src/controllers/applicationController.js
import Application from "../models/applicationModel.js";
import Job from "../models/jobModel.js";

export const createApplication = async (req, res) => {
  try {
    const { jobId } = req.body;

    const job = await Job.findOne({ _id: jobId, isActive: true });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    if (new Date(job.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Application deadline has passed"
      });
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      user: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job"
      });
    }

    const application = await Application.create({
      job: jobId,
      user: req.user._id
    });

    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error("application error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating application",
      error: error.message
    });
  }
};

export const getApplicationsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const applications = await Application.find({ job: jobId })
      .populate("user", "name email")
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching applications",
      error: error.message
    });
  }
};

export const getApplicationsByUser = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user._id })
      .populate("job", "title company location deadline")
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error("Get user applications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user applications",
      error: error.message
    });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate("user", "name email")
     .populate("job", "title company");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error("Update application status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating application status",
      error: error.message
    });
  }
};