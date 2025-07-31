"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logout } from "@/app/store/slices/authSlice";
import Link from "next/link";
import {
  Crown,
  Shield,
  Code,
  User,
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Users,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  Bell,
  Search,
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  // Browser back kontrolü
  useEffect(() => {
    const handlePopState = () => {
      if (isAuthenticated && window.location.pathname === "/login") {
        router.replace("/dashboard");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "Admin":
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case "Manager":
        return <Shield className="w-4 h-4 text-blue-600" />;
      case "Developer":
        return <Code className="w-4 h-4 text-green-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Admin":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Manager":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Developer":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Rol bazlı menü öğeleri
  const getMenuItems = (role) => {
    const baseItems = [
      {
        href: "/dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
        label: "Dashboard",
        roles: ["Admin", "Manager", "Developer"],
      },
      {
        href: "/projects",
        icon: <FolderOpen className="w-5 h-5" />,
        label: "Projeler",
        roles: ["Admin", "Manager", "Developer"],
      },
      {
        href: "/tasks",
        icon: <CheckSquare className="w-5 h-5" />,
        label: "Görevler",
        roles: ["Admin", "Manager", "Developer"],
      },
    ];

    const adminItems = [
      {
        href: "/users",
        icon: <Users className="w-5 h-5" />,
        label: "Kullanıcılar",
        roles: ["Admin"],
      },
      {
        href: "/reports",
        icon: <BarChart3 className="w-5 h-5" />,
        label: "Raporlar",
        roles: ["Admin", "Manager"],
      },
      {
        href: "/settings",
        icon: <Settings className="w-5 h-5" />,
        label: "Ayarlar",
        roles: ["Admin"],
      },
    ];

    const allItems = [...baseItems, ...adminItems];
    return allItems.filter((item) => item.roles.includes(role));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
          <h1 className="text-xl font-bold text-white">TaskFlow</h1>
        </div>

        {/* User Profile Card */}
        <div className="p-4 border-b border-gray-200">
          <div className={`p-3 rounded-lg border ${getRoleColor(user?.role)}`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-white">
                  {user?.name?.charAt(0)?.toUpperCase() ||
                    user?.email?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || user?.email}
                </p>
                <div className="flex items-center space-x-1">
                  {getRoleIcon(user?.role)}
                  <p className="text-xs font-medium">{user?.role || "User"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-4">
          <div className="space-y-1">
            {getMenuItems(user?.role || "Developer").map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors group"
              >
                <span className="mr-3 text-gray-400 group-hover:text-gray-600">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Rol Bilgisi */}
        <div className="px-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-2">
              Yetki Seviyesi
            </h4>
            <div className="flex items-center space-x-2">
              {getRoleIcon(user?.role)}
              <span className="text-sm font-medium text-gray-700">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {user?.role === "Admin" && "Tüm sistem yetkileri"}
              {user?.role === "Manager" && "Proje yönetim yetkileri"}
              {user?.role === "Developer" && "Görev yönetim yetkileri"}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <div className="absolute bottom-0 w-full p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:px-6">
          {/* Mobile Menu Button */}
          <button
            className="p-2 text-gray-600 lg:hidden hover:bg-gray-100 rounded-lg"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Search Bar - Sadece büyük ekranlarda göster */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Proje, görev veya kullanıcı ara..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Top Bar Actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">3</span>
              </span>
            </button>

            {/* User Role Badge */}
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(
                user?.role
              )}`}
            >
              <div className="flex items-center space-x-1">
                {getRoleIcon(user?.role)}
                <span>{user?.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1">{children}</main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
