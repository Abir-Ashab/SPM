import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.util';
import { Product } from '../models/product.model';
import { Order } from '../models/order.model';
import { Conversation } from '../models/conversation.model';

export const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  // Get total products count
  const totalProducts = await Product.countDocuments();

  // Get user's orders count
  const totalOrders = await Order.countDocuments({ userId: userId });

  // Get user's conversations count
  const totalConversations = await Conversation.countDocuments({ user: userId, isActive: true });

  // Calculate average response time (mock for now, but you can implement based on message timestamps)
  const avgResponseTime = "0.8s";

  res.status(200).json({
    success: true,
    message: 'Dashboard statistics fetched successfully',
    data: {
      totalProducts,
      totalOrders,
      totalConversations,
      avgResponseTime,
    },
  });
});

export const getRecentActivity = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const limit = parseInt(req.query.limit as string) || 10;

  // Get recent orders
  const recentOrders = await Order.find({ userId: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('orderNumber totalAmount status createdAt');

  // Get recent conversations
  const recentConversations = await Conversation.find({ user: userId, isActive: true })
    .sort({ lastActivity: -1 })
    .limit(limit)
    .select('title lastActivity messages');

  // Combine and sort all activities
  const activities = [
    ...recentOrders.map(order => ({
      id: String(order._id),
      action: order.status === 'delivered' ? 'Order completed' : 'New order placed',
      details: `Order #${String(order._id).slice(-6)} - $${order.totalAmount.toFixed(2)}`,
      time: order.createdAt,
      type: 'order',
    })),
    ...recentConversations.map(conv => ({
      id: String(conv._id),
      action: 'Chat conversation',
      details: conv.title || 'Product inquiry',
      time: conv.lastActivity,
      type: 'chat',
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, limit)
    .map(activity => ({
      ...activity,
      time: formatTimeAgo(new Date(activity.time)),
    }));

  res.status(200).json({
    success: true,
    message: 'Recent activity fetched successfully',
    data: activities,
  });
});

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }
}

export const dashboardController = {
  getDashboardStats,
  getRecentActivity,
};
