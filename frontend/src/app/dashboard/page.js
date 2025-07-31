"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logout } from "@/app/store/slices/authSlice";
import DashboardLayout from "../../components/DashboardLayout";
import ProjectBoard from "../../components/ProjectBoard";
import {
  Crown,
  Shield,
  Code,
  User,
  LogOut,
  Settings,
  Bell,
} from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { projects } = useSelector((state) => state.projects);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      // History'yi temizle, login sayfasına geri dönüşü engelle
      if (typeof window !== "undefined" && window.history.length > 1) {
        window.history.replaceState(null, "", "/dashboard");
      }
    }
  }, [isAuthenticated, router]);

  // Browser back tuşunu yakala
  useEffect(() => {
    const handlePopState = (event) => {
      if (isAuthenticated && window.location.pathname === "/login") {
        event.preventDefault();
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
        return <Crown className="w-5 h-5 text-yellow-600" />;
      case "Manager":
        return <Shield className="w-5 h-5 text-blue-600" />;
      case "Developer":
        return <Code className="w-5 h-5 text-green-600" />;
      default:
        return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Admin":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Manager":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Developer":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRolePermissions = (role) => {
    switch (role) {
      case "Admin":
        return [
          "Tüm projeleri görüntüleme",
          "Tüm kullanıcıları yönetme",
          "Sistem ayarlarını değiştirme",
          "Tüm görevleri düzenleme",
          "Şirket geneli raporlar",
        ];
      case "Manager":
        return [
          "Kendi projelerini yönetme",
          "Takım üyelerini atama",
          "Proje raporlarını görüntüleme",
          "Görev durumlarını değiştirme",
          "Takım performansını izleme",
        ];
      case "Developer":
        return [
          "Atanan projeleri görüntüleme",
          "Kendi görevlerini güncelleme",
          "Görev yorumları ekleme",
          "Dosya yükleme",
          "Zaman takibi",
        ];
      default:
        return ["Temel kullanıcı yetkileri"];
    }
  };

  const getWelcomeMessage = (role) => {
    switch (role) {
      case "Admin":
        return "Sistem yöneticisi olarak tüm projeleri ve kullanıcıları yönetebilirsiniz.";
      case "Manager":
        return "Proje yöneticisi olarak takımınızı ve projelerinizi etkili şekilde yönetebilirsiniz.";
      case "Developer":
        return "Geliştirici olarak size atanan görevleri tamamlayabilir ve projelerinize katkıda bulunabilirsiniz.";
      default:
        return "Projelerinizi yönetin ve görevlerinizi takip edin.";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Başlık ve Rol Bilgisi */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                Hoş geldin, {user?.name || user?.email} 👋
                <div
                  className={`ml-4 px-3 py-1 rounded-lg border-2 flex items-center space-x-2 ${getRoleColor(
                    user?.role
                  )}`}
                >
                  {getRoleIcon(user?.role)}
                  <span className="font-semibold text-sm">{user?.role}</span>
                </div>
              </h1>
              <p className="text-gray-600 mb-2">
                {getWelcomeMessage(user?.role)}
              </p>
            </div>

            {/* Hızlı Çıkış Butonu */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push("/settings")}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Ayarlar"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push("/notifications")}
                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors relative"
                title="Bildirimler"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-[10px] text-white font-bold">3</span>
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center space-x-2"
                title="Çıkış Yap"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Çıkış</span>
              </button>
            </div>
          </div>

          {/* Rol Yetkileri */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              {user?.role} Yetkileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {getRolePermissions(user?.role).map((permission, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">{permission}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Test Farklı Roller - Sadece development modunda göster */}
          {process.env.NODE_ENV === "development" && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                🧪 Farklı Rolleri Test Edin
              </h3>
              <p className="text-blue-700 mb-3 text-sm">
                Sistem rollerini test etmek için çıkış yapıp farklı hesaplarla
                giriş yapabilirsiniz:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Crown className="w-4 h-4 text-yellow-600" />
                    <span className="font-semibold text-yellow-800 text-sm">
                      Admin
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">admin@taskflow.com</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-800 text-sm">
                      Manager
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">manager@taskflow.com</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Code className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-800 text-sm">
                      Developer
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    developer@taskflow.com
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hızlı İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {user?.role === "Admin" ? "Tüm Projeler" : "Projelerim"}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {user?.role === "Developer"
                    ? "Atanan Görevler"
                    : "Bekleyen Görevler"}
                </p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Devam Eden</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tamamlanan</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Proje Boardları */}
        <ProjectBoard />
      </div>
    </DashboardLayout>
  );
}


