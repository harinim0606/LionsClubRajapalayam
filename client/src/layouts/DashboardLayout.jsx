import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  User, 
  ShieldAlert, 
  LogOut 
} from 'lucide-react';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Member Directory', path: '/members', icon: Users },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Admin Portal', path: '/admin', icon: ShieldAlert },
  ];

  const handleLogout = () => {
    // Basic logout redirect for now
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bg-light flex flex-col font-sans">
      {/* Fixed Top Navbar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-primary text-white flex items-center justify-between px-4 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-primary-hover rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-white m-0 font-heading">
              Lions Club <span className="text-secondary font-extrabold">Rajapalayam</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-xs text-slate-300 font-medium">Logged in as</p>
            <p className="text-sm font-semibold text-white">Administrator</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-secondary text-primary flex items-center justify-center font-bold shadow-sm">
            A
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 pt-16 relative">
        {/* Sidebar */}
        <aside 
          className={`fixed top-16 bottom-0 left-0 z-40 bg-white border-r border-slate-200 transition-all duration-300 flex flex-col justify-between ${
            sidebarOpen ? 'w-64' : 'w-0 -translate-x-full md:w-16 md:translate-x-0'
          } overflow-hidden`}
        >
          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                    isActive 
                      ? 'bg-primary/5 text-primary font-semibold' 
                      : 'text-text-muted hover:bg-slate-50 hover:text-primary'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-primary' : 'text-slate-400 group-hover:text-primary'} />
                  <span className={`transition-opacity duration-300 ${!sidebarOpen && 'md:opacity-0 md:w-0'}`}>
                    {item.name}
                  </span>
                  
                  {/* Tooltip for collapsed mode */}
                  {!sidebarOpen && (
                    <span className="absolute left-14 bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block z-50">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout Footer */}
          <div className="p-3 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors group relative cursor-pointer"
            >
              <LogOut size={20} className="text-red-500" />
              <span className={`transition-opacity duration-300 ${!sidebarOpen && 'md:opacity-0 md:w-0'}`}>
                Sign Out
              </span>
              {!sidebarOpen && (
                <span className="absolute left-14 bg-red-600 text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block z-50">
                  Sign Out
                </span>
              )}
            </button>
          </div>
        </aside>

        {/* Content Wrapper */}
        <main 
          className={`flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300 ${
            sidebarOpen ? 'pl-0 md:pl-64' : 'pl-0 md:pl-16'
          }`}
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
