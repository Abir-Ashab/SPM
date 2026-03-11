import { Order, IOrder } from '../models/order.model';
import { Product } from '../models/product.model';

export class OrderService {
  // Create a new order
  static async createOrder(orderData: Partial<IOrder>): Promise<IOrder> {
    // Validate products and calculate total
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of orderData.items || []) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      validatedItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
      });

      totalAmount += product.price * item.quantity;
    }

    const order = await Order.create({
      ...orderData,
      items: validatedItems,
      totalAmount,
    });

    // Update product stock
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    return order;
  }

  // Get orders by user
  static async getUserOrders(userId: string): Promise<IOrder[]> {
    return await Order.find({ userId }).sort({ createdAt: -1 }).populate('items.productId');
  }

  // Get order by ID
  static async getOrderById(orderId: string): Promise<IOrder | null> {
    return await Order.findById(orderId).populate('items.productId');
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: string): Promise<IOrder | null> {
    return await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
  }

  // Get all orders (admin)
  static async getAllOrders(): Promise<IOrder[]> {
    return await Order.find().sort({ createdAt: -1 }).populate('userId', 'name email');
  }

  // Cancel order
  static async cancelOrder(orderId: string): Promise<IOrder | null> {
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'pending' && order.status !== 'processing') {
      throw new Error('Cannot cancel order in current status');
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    order.status = 'cancelled';
    await order.save();

    return order;
  }
}
