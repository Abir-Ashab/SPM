import api from './api';

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalConversations: number;
  avgResponseTime: string;
}

export interface Activity {
  id: string;
  action: string;
  details: string;
  time: string;
  type: 'order' | 'chat' | 'search';
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data.data;
  },

  getRecentActivity: async (limit: number = 10): Promise<Activity[]> => {
    const response = await api.get(`/dashboard/activity?limit=${limit}`);
    return response.data.data;
  },
};
