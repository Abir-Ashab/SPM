import { Link, useLocation } from "react-router-dom";
import { 
  FiHome, FiUser, FiChevronDown, FiMessageCircle, FiShoppingBag, FiPackage
} from "react-icons/fi";

export default function Navbar({ user, onUserClick }: { user: any; onUserClick: () => void }) {
  const location = useLocation();
  
  const navItems = [
    { path: "/dashboard", icon: <FiHome size={18} />, label: "Dashboard", description: "Overview & stats" },
    { path: "/chat", icon: <FiMessageCircle size={18} />, label: "Chatbot", description: "Ask about products" },
    { path: "/products", icon: <FiShoppingBag size={18} />, label: "Products", description: "Browse catalog" },
    { path: "/orders", icon: <FiPackage size={18} />, label: "Orders", description: "View your orders" }
  ];

  return (
    <>
      <nav className="hidden md:flex md:flex-col md:w-64 h-screen bg-white border-r border-slate-200/60 shadow-sm fixed left-0 top-0 z-30">
        <div className="flex flex-col h-full">
          <div className="flex-shrink-0 p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="4" width="12" height="16" rx="1" fill="white" opacity="0.9"/>
                  <rect x="7" y="6" width="6" height="1" rx="0.5" fill="#3B82F6" opacity="0.7"/>
                  <rect x="7" y="8" width="4" height="1" rx="0.5" fill="#3B82F6" opacity="0.5"/>
                  <circle cx="22" cy="12" r="4" fill="white" opacity="0.9"/>
                  <circle cx="20" cy="10" r="0.5" fill="#3B82F6"/>
                  <circle cx="24" cy="10" r="0.5" fill="#3B82F6"/>
                  <circle cx="22" cy="12" r="0.5" fill="#3B82F6"/>
                  <circle cx="20" cy="14" r="0.5" fill="#3B82F6"/>
                  <circle cx="24" cy="14" r="0.5" fill="#3B82F6"/>
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">ShopBot</h1>
                <p className="text-xs text-slate-500">Smart Shopping</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-4 pt-6">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 relative ${
                      isActive 
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm border border-blue-200/50" 
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                      isActive 
                        ? "bg-blue-100 text-blue-600 shadow-sm" 
                        : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                    }`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-sm">{item.label}</div>
                      <div className="text-xs text-slate-500 truncate">{item.description}</div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex-shrink-0 p-4 border-t border-slate-100">
            <button
              onClick={onUserClick}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-all duration-300 hover:shadow-md group"
            >
              <div className="relative flex-shrink-0">
                {user?.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200 group-hover:ring-slate-300 transition-all duration-300"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <FiUser className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-medium text-slate-800 truncate text-sm">
                  {user?.name || "Guest User"}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {user?.email || "guest@example.com"}
                </div>
              </div>
              <FiChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-all duration-300 flex-shrink-0" />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}