import { 
  FiTrendingUp, 
  FiFileText, 
  FiMessageSquare, 
  FiClock, 
  FiActivity,
  FiDownload,
  FiSearch
} from "react-icons/fi";
import { useEffect, useState } from "react";
import { dashboardService, type DashboardStats, type Activity } from "../../services/dashboard";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalConversations: 0,
    avgResponseTime: "0.0s"
  });
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, activityData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRecentActivity(4)
        ]);
        setStats(statsData);
        setRecentActivity(activityData);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Welcome to ShopBot
              </h1>
              <p className="text-slate-600 text-lg">
                Your AI shopping assistant - discover products, place orders, and get instant help
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">All systems operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading dashboard data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Products in Catalog</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalProducts}</p>
                <div className="flex items-center gap-1 mt-2">
                  <FiActivity className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-600 text-sm font-medium">Available</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FiFileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalOrders}</p>
                <div className="flex items-center gap-1 mt-2">
                  <FiTrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 text-sm font-medium">+28% this month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FiMessageSquare className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Conversations</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalConversations}</p>
                <div className="flex items-center gap-1 mt-2">
                  <FiTrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 text-sm font-medium">+45% this month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FiSearch className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Avg Response Time</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.avgResponseTime}</p>
                <div className="flex items-center gap-1 mt-2">
                  <FiActivity className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-600 text-sm font-medium">Lightning fast</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <FiClock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View all
                </button>
              </div>
              
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors duration-200">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activity.type === 'order' ? 'bg-green-100' :
                        activity.type === 'chat' ? 'bg-blue-100' :
                        activity.type === 'search' ? 'bg-purple-100' : 'bg-orange-100'
                      }`}>
                        {activity.type === 'order' && <FiDownload className={`w-5 h-5 text-green-600`} />}
                        {activity.type === 'chat' && <FiMessageSquare className={`w-5 h-5 text-blue-600`} />}
                        {activity.type === 'search' && <FiSearch className={`w-5 h-5 text-purple-600`} />}
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{activity.action}</p>
                        <p className="text-sm text-slate-600">{activity.details}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-slate-500">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <FiActivity className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No recent activity yet</p>
                    <p className="text-sm mt-1">Start chatting to see your activity here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white mb-6">
              <div className="flex items-center gap-2 mb-4">
                <FiActivity className="w-5 h-5" />
                <h3 className="font-bold">Quick Stats</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-100 text-sm">Products Available</span>
                  <span className="font-medium">{stats.totalProducts}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-blue-100 text-sm">Your Orders</span>
                  <span className="font-medium">{stats.totalOrders}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-blue-100 text-sm">Conversations</span>
                  <span className="font-medium">{stats.totalConversations}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-blue-500/30">
                <p className="text-blue-100 text-xs">
                  💡 Chat with our AI assistant to discover products and place orders instantly!
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FiMessageSquare className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Features</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Natural Language Chat</p>
                    <p className="text-xs text-slate-600">Ask questions naturally</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Image Search</p>
                    <p className="text-xs text-slate-600">Upload product images</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Smart Ordering</p>
                    <p className="text-xs text-slate-600">Order through conversation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
