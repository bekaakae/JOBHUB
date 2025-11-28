// src/models/categoryModel.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  description: { 
    type: String 
  },
  icon: { 
    type: String 
  },
  color: { 
    type: String,
    default: "#10B981" // Green color
  },
  jobCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// Update job count when jobs are added/removed
categorySchema.methods.updateJobCount = async function() {
  const Job = mongoose.model('Job');
  const count = await Job.countDocuments({ category: this._id, isActive: true });
  this.jobCount = count;
  await this.save();
};

export default mongoose.model("Category", categorySchema);