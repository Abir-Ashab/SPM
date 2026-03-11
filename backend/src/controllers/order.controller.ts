import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { catchAsync } from '../utils/catchAsync.util';

export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User authentication required',
    });
  }

  const orderData = {
    ...req.body,
    userId,
  };

  const order = await OrderService.createOrder(orderData);

  res.status(201).json({
    success: true,
    data: order,
  });
});

export const getUserOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User authentication required',
    });
  }

  const orders = await OrderService.getUserOrders(userId);

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

export const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const order = await OrderService.getOrderById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

export const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Status is required',
    });
  }

  const order = await OrderService.updateOrderStatus(req.params.id, status);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

export const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const orders = await OrderService.getAllOrders();

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

export const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await OrderService.cancelOrder(req.params.id);

  res.status(200).json({
    success: true,
    data: order,
  });
});
