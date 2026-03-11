import { 
  FiTrendingUp, 
  FiFileText, 
  FiMessageSquare, 
  FiClock, 
  FiActivity,
  FiDownload,
  FiSearch,
  FiStar
} from "react-icons/fi";

export default function Dashboard() {
  // Mock data - replace with real data from your API
  const stats = {
    totalDocuments: 24,
    totalChats: 156,
    totalQueries: 1024,
    responseTime: "0.8s"
  };

  const recentActivity = [
    { id: 1, action: "Document uploaded", file: "Resume.pdf", time: "2 hours ago", type: "upload" },
    { id: 2, action: "Chat session", file: "Project_Plan.pdf", time: "4 hours ago", type: "chat" },
    { id: 3, action: "Document analyzed", file: "Research_Paper.pdf", time: "1 day ago", type: "analysis" },
    { id: 4, action: "Query answered", file: "Company_Policy.pdf", time: "2 days ago", type: "query" },
  ];

  const popularDocuments = [
    { name: "Resume.pdf", queries: 45, lastAccessed: "Today" },
    { name: "Project_Guidelines.pdf", queries: 32, lastAccessed: "Yesterday" },
    { name: "Technical_Manual.pdf", queries: 28, lastAccessed: "2 days ago" },
    { name: "Meeting_Notes.pdf", queries: 19, lastAccessed: "3 days ago" },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Welcome to DocuMind
              </h1>
              <p className="text-slate-600 text-lg">
                Your intelligent document companion - chat, analyze, and discover insights
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Documents</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalDocuments}</p>
                <div className="flex items-center gap-1 mt-2">
                  <FiTrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 text-sm font-medium">+12% this month</span>
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
                <p className="text-slate-500 text-sm font-medium">Chat Sessions</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalChats}</p>
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
                <p className="text-slate-500 text-sm font-medium">Total Queries</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalQueries}</p>
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
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.responseTime}</p>
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
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors duration-200">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.type === 'upload' ? 'bg-blue-100' :
                      activity.type === 'chat' ? 'bg-green-100' :
                      activity.type === 'analysis' ? 'bg-purple-100' : 'bg-orange-100'
                    }`}>
                      {activity.type === 'upload' && <FiDownload className={`w-5 h-5 text-blue-600`} />}
                      {activity.type === 'chat' && <FiMessageSquare className={`w-5 h-5 text-green-600`} />}
                      {activity.type === 'analysis' && <FiActivity className={`w-5 h-5 text-purple-600`} />}
                      {activity.type === 'query' && <FiSearch className={`w-5 h-5 text-orange-600`} />}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{activity.action}</p>
                      <p className="text-sm text-slate-600">{activity.file}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-slate-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Popular Documents</h2>
                <FiStar className="w-5 h-5 text-yellow-500" />
              </div>
              
              <div className="space-y-4">
                {popularDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-200">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FiFileText className="w-4 h-4 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate text-sm">{doc.name}</p>
                      <p className="text-xs text-slate-500">{doc.queries} queries</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-slate-500">{doc.lastAccessed}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <FiActivity className="w-5 h-5" />
                <h3 className="font-bold">Quick Insights</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-100 text-sm">Most active today</span>
                  <span className="font-medium">Resume.pdf</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-blue-100 text-sm">Peak usage time</span>
                  <span className="font-medium">2:00 PM - 4:00 PM</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-blue-100 text-sm">Success rate</span>
                  <span className="font-medium">98.5%</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-blue-500/30">
                <p className="text-blue-100 text-xs">
                  💡 Your documents are being accessed 45% more than last month!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
