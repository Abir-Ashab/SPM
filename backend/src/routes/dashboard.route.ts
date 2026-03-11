import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { dashboardController } from '../controllers/dashboard.controller';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authMiddleware(), dashboardController.getDashboardStats);

// Get recent activity
router.get('/activity', authMiddleware(), dashboardController.getRecentActivity);

export default router;
