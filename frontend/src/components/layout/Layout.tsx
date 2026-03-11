import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import api from "../../services/api";
import Navbar from "./Navbar";
import UserSidebar from "./UserSidebar";

interface User {
  name?: string;
  email?: string;
  profile_picture?: string;
}

export default function Layout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUserSidebar, setShowUserSidebar] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get("/users/profile");
        setUser(res.data.data);
      } catch (err) {
        console.error("Failed to fetch user", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-slate-200 rounded-full animate-spin"></div>
            <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">Loading ShopBot</h2>
            <p className="text-slate-600">Preparing your dashboard...</p>
            <div className="flex justify-center items-center gap-2 mt-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="flex h-screen">
        <Navbar user={user} onUserClick={() => setShowUserSidebar(true)} />
        
        <main className="flex-1 overflow-y-auto relative md:ml-64 bg-gradient-to-br from-slate-50/50 to-white">
          <div className="min-h-full pb-20 md:pb-0">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-blue-100/20 to-indigo-100/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-100/20 to-pink-100/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
            </div>
            
            <div className="relative z-10">
              <Outlet context={{ user }} />
            </div>
          </div>
        </main>

        {/* User Sidebar */}
        <UserSidebar 
          user={user}
          isOpen={showUserSidebar}
          onClose={() => setShowUserSidebar(false)}
        />
      </div>
    </div>
  );
}
