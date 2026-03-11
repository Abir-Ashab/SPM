import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// All order routes require authentication
router.use(authMiddleware());

// Order management
router.post('/', orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/all', orderController.getAllOrders); // Admin only
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', orderController.updateOrderStatus);
router.post('/:id/cancel', orderController.cancelOrder);

export default router;
