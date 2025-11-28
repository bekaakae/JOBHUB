import express from 'express';
import protect from '../middleware/authMiddleware.js';
import {
  toggleLike,
  getLikesByJob,
  checkUserLike
} from '../controllers/likeController.js';

const router = express.Router();

// Corrected like routes
router.post('/toggle', protect, toggleLike);
router.get('/job/:jobId', getLikesByJob);
router.get('/job/:jobId/check', protect, checkUserLike);

export default router;