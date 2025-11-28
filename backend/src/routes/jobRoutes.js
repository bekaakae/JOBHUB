import express from 'express';
import {
  createJob,
  getJobs,
  getUrgentJobs,
  getJob,
  updateJob,
  deleteJob,
  getJobsByCategory
} from '../controllers/jobController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getJobs);
router.get('/urgent', getUrgentJobs);
router.get('/category/:categoryId', getJobsByCategory);
router.get('/:id', getJob);

// Protected routes (require authentication)
router.post('/', protect, createJob);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);

export default router;