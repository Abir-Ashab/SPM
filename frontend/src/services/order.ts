import api from "./api";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status:
    | "pending"
    | "processing"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "cancelled";
  shippingAddress: ShippingAddress;
  contactPhone?: string;
  notes?: string;
  conversationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: ShippingAddress;
  contactPhone?: string;
  notes?: string;
  conversationId?: string;
}

export const orderService = {
  // Create a new order
  createOrder: async (orderData: CreateOrderData): Promise<Order> => {
    const response = await api.post("/orders", orderData);
    return response.data.data;
  },

  // Get user's orders
  getUserOrders: async (): Promise<Order[]> => {
    const response = await api.get("/orders");
    return response.data.data;
  },

  // Get order by ID
  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data.data;
  },

  // Update order status
  updateOrderStatus: async (
    orderId: string,
    status: string,
  ): Promise<Order> => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data.data;
  },

  // Cancel order
  cancelOrder: async (orderId: string): Promise<Order> => {
    const response = await api.post(`/orders/${orderId}/cancel`);
    return response.data.data;
  },

  // Get all orders (admin)
  getAllOrders: async (): Promise<Order[]> => {
    const response = await api.get("/orders/all");
    return response.data.data;
  },
};
