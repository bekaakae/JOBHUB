import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate likes
likeSchema.index({ user: 1, job: 1 }, { unique: true });

export default mongoose.model('Like', likeSchema);