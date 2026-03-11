import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FiX, FiUser, FiLogOut, FiEdit3, FiUpload, FiFolder
} from "react-icons/fi";

interface UserSidebarProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserSidebar({ user, isOpen, onClose }: UserSidebarProps) {
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur effect */}
      <div className="fixed inset-0 backdrop-blur-sm bg-slate-900/20 z-40 transition-all duration-300" />
      
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Account</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
          >
            <FiX className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            {user?.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-slate-100"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
                <FiUser className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 truncate text-lg">
                {user?.name || "Guest User"}
              </h3>
              <p className="text-slate-600 truncate text-sm">
                {user?.email || "guest@example.com"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-slate-500">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-2">
            <Link
              to="/profile"
              onClick={onClose}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-200 group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                <FiEdit3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-slate-900">Edit Profile</div>
                <div className="text-sm text-slate-600">Update your information</div>
              </div>
            </Link>

            <Link
              to="/upload"
              onClick={onClose}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-200 group"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                <FiUpload className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-slate-900">Upload Documents</div>
                <div className="text-sm text-slate-600">Upload your files</div>
              </div>
            </Link>

            <Link
              to="/documents"
              onClick={onClose}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-200 group"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors duration-200">
                <FiFolder className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="font-medium text-slate-900">My Documents</div>
                <div className="text-sm text-slate-600">View your documents</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors duration-200 group"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
