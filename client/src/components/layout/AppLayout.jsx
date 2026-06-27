import { useState } from "react";
import logo from "../../assets/logoLionsClub.jpeg";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, LogOut, User, LayoutDashboard, 
  Users, UserCircle, UserPlus, FileDown, FileUp, History, ChevronLeft, ChevronRight, Settings, MessageCircle
} from "lucide-react";

const AppLayout = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  if (!user) return null;

  const isAdmin = user.role === "admin";

  // ── Admin sidebar
  const adminNavItems = [
    { name: t("sidebar.dashboard"),          path: "/admin/dashboard",        icon: LayoutDashboard },
    { name: t("sidebar.memberDirectory"),    path: "/directory",              icon: Users },
    { name: t("sidebar.communication"),      path: "/admin/communication",    icon: MessageCircle },
    { name: t("sidebar.memberManagement"),   path: "/admin/members",          icon: UserPlus },
    { name: t("sidebar.excelImport"),        path: "/admin/import",           icon: FileUp },
    { name: t("sidebar.importHistory"),      path: "/admin/import-history",   icon: History },
    { name: t("sidebar.excelExport"),        path: "/admin/export",           icon: FileDown },
    { name: t("sidebar.myProfile"),          path: "/my-profile",             icon: UserCircle },
    { name: t("sidebar.settings"),           path: "/settings",               icon: Settings },
  ];

  // ── Member sidebar
  const memberNavItems = [
    { name: t("sidebar.dashboard"),        path: "/member/dashboard",  icon: LayoutDashboard },
    { name: t("sidebar.memberDirectory"),  path: "/directory",         icon: Users },
    { name: t("sidebar.communication"),    path: "/member/communication", icon: MessageCircle },
    { name: t("sidebar.myProfile"),        path: "/my-profile",        icon: UserCircle },
    { name: t("sidebar.settings"),         path: "/settings",          icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : memberNavItems;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <div className="h-screen flex overflow-hidden bg-[var(--color-bg-light)]">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-gray-900/50 md:hidden"
            onClick={toggleMobileMenu}
          />
        )}
      </AnimatePresence>

      {/* Sidebar (Desktop & Mobile) */}
      <motion.aside
        initial={false}
        animate={{ 
          width: sidebarOpen ? 260 : 80,
          x: mobileMenuOpen ? 0 : (window.innerWidth < 768 ? -260 : 0) // rough mobile check
        }}
        className={`fixed md:relative z-50 h-full bg-[var(--color-card-bg)] border-r border-[var(--color-border)] shadow-sm flex flex-col transition-all duration-300 ease-in-out ${
          !mobileMenuOpen && "hidden md:flex"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <img
              src={logo}
              alt="Lions Club Logo"
              className="w-14 h-14 object-contain shrink-0"
            />
            {sidebarOpen && (
              <div className="flex flex-col leading-tight">
                <span className="font-heading font-bold text-gray-900 dark:text-white text-sm">
                  Lions Club
                </span>
                <span className="font-heading text-xs text-[#0A2A5E] dark:text-[#F4B400] font-semibold">
                  Rajapalayam
                </span>
              </div>
            )}
          </div>
          {/* Mobile close button */}
          <button onClick={toggleMobileMenu} className="md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? "bg-[#0A2A5E] text-white shadow-md shadow-[#0A2A5E]/20 dark:bg-[#F4B400] dark:text-black dark:shadow-[#F4B400]/20" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#0A2A5E] dark:hover:text-white"
                }`}
              >
                <item.icon size={22} className={`shrink-0 ${isActive ? "text-[#F4B400]" : "text-gray-400 group-hover:text-[#0A2A5E]"}`} />
                {sidebarOpen && (
                  <span className="font-medium whitespace-nowrap">{item.name}</span>
                )}
              </NavLink>
            )
          })}
        </div>

        {/* Collapse Toggle Button (Desktop only) */}
        <div className="hidden md:flex p-4 border-t border-gray-100">
          <button 
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center p-2 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[var(--color-bg-light)]">
        
        {/* Top Navbar */}
        <header className="h-16 bg-[var(--color-card-bg)] border-b border-[var(--color-border)] shadow-sm flex items-center justify-between px-4 sm:px-6 z-30 shrink-0">
          <div className="flex items-center">
            <button 
              onClick={toggleMobileMenu}
              className="p-2 mr-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg md:hidden"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-heading font-semibold text-gray-800 hidden sm:block truncate">
              {navItems.find(item => location.pathname.includes(item.path))?.name || "Portal"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{t(`sidebar.${user.role}`)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User size={20} className="text-gray-400" />
                )}
              </div>
            </div>
            <div className="w-px h-8 bg-gray-200 mx-1 hidden sm:block"></div>
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
              title="Logout"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[var(--color-bg-light)]">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
        
      </div>
    </div>
  );
};

export default AppLayout;
