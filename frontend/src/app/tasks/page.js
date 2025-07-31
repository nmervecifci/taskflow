"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../components/DashboardLayout";
import { loadUserFromStorage } from "../store/slices/authSlice";

export default function TasksPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  const [filter, setFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [allTasks, setAllTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // İlk yüklemede auth durumunu kontrol et - artık gereksiz
  // useEffect(() => {
  //   console.log("🔍 Loading auth from storage...");
  //   dispatch(loadUserFromStorage());
  // }, [dispatch]);

  // Auth durumu kontrol edip task'ları yükle
  useEffect(() => {
    // Auth henüz yüklenmediyse bekle
    if (isLoading) {
      console.log("⏳ Auth still loading, waiting...");
      return;
    }

    // Token var mı kontrol et
    const token = localStorage.getItem("token");

    if (!token || !isAuthenticated) {
      console.log("❌ No auth, redirecting to login");
      router.push("/login");
      return;
    }

    console.log("✅ Auth confirmed, loading tasks...");
    fetchTasks();
  }, [isAuthenticated, isLoading, router]);

  const fetchTasks = async () => {
    try {
      setTasksLoading(true);
      console.log("🔍 Fetching tasks from API...");

      const token = localStorage.getItem("token");
      console.log("🔑 Token exists:", !!token);

      // Gerçek API çağrısı
      const response = await fetch("http://localhost:5001/api/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 API Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Tasks received:", data);
        console.log("📊 Tasks count:", data.data?.length || 0);

        if (data.data && data.data.length > 0) {
          setAllTasks(data.data);
        } else {
          console.log("⚠️ No tasks found in API, using demo data");
          setAllTasks(getDemoTasks());
        }
      } else {
        console.error("❌ API failed with status:", response.status);
        const errorText = await response.text();
        console.error("❌ Error response:", errorText);
        setAllTasks(getDemoTasks());
      }
    } catch (error) {
      console.error("💥 Error fetching tasks:", error);
      console.log("🔄 Falling back to demo data");
      setAllTasks(getDemoTasks());
    } finally {
      setTasksLoading(false);
    }
  };

  // Demo task verileri (API olmadığında)
  const getDemoTasks = () => [
    {
      _id: "task1",
      title: "UI Tasarım Mockup",
      description:
        "Ana sayfa ve alt sayfalar için wireframe ve mockup hazırlanması",
      status: "in-progress",
      priority: "high",
      project: {
        _id: "project1",
        title: "Website Redesign",
      },
      assignedTo: {
        name: "Test User",
        email: "test@example.com",
      },
      dueDate: "2024-02-15",
      createdAt: "2024-01-20",
    },
    {
      _id: "task2",
      title: "Backend API Geliştirme",
      description: "RESTful API endpoints ve database şeması oluşturulması",
      status: "pending",
      priority: "high",
      project: {
        _id: "project2",
        title: "Mobile App",
      },
      assignedTo: {
        name: "Test User",
        email: "test@example.com",
      },
      dueDate: "2024-02-20",
      createdAt: "2024-01-22",
    },
    {
      _id: "task3",
      title: "Test Senaryoları",
      description: "Unit test ve integration test senaryolarının yazılması",
      status: "completed",
      priority: "medium",
      project: {
        _id: "project1",
        title: "Website Redesign",
      },
      assignedTo: {
        name: "Test User",
        email: "test@example.com",
      },
      dueDate: "2024-01-30",
      createdAt: "2024-01-18",
    },
  ];

  // Utility functions
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "in-progress":
        return "🔄";
      case "completed":
        return "✅";
      default:
        return "❓";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "⚪";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Bekleyen";
      case "in-progress":
        return "Devam Eden";
      case "completed":
        return "Tamamlanan";
      default:
        return status;
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case "high":
        return "Yüksek";
      case "medium":
        return "Orta";
      case "low":
        return "Düşük";
      default:
        return priority;
    }
  };

  // Filtreleme logic'i
  const filteredTasks = allTasks.filter((task) => {
    const matchesSearch =
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.project?.title?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;
    const matchesStatus = filter === "all" || task.status === filter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Loading state - auth loading
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <span className="ml-3 text-gray-600 mt-4 block">
              Kimlik doğrulanıyor...
            </span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Auth kontrolü
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
        {/* Başlık */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Tüm Görevler</h1>
          <p className="text-gray-600 mt-1">
            Tüm projelerinizdeki görevleri görüntüleyin ve yönetin
          </p>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Toplam Görev
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {allTasks.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-yellow-600"
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
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Bekleyen</p>
                <p className="text-lg font-bold text-gray-900">
                  {allTasks.filter((task) => task.status === "pending").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-orange-600"
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
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Devam Eden</p>
                <p className="text-lg font-bold text-gray-900">
                  {
                    allTasks.filter((task) => task.status === "in-progress")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-green-600"
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
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Tamamlanan</p>
                <p className="text-lg font-bold text-gray-900">
                  {
                    allTasks.filter((task) => task.status === "completed")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtreler ve Arama */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Arama */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Görevlerde ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="pending">Bekleyen</option>
              <option value="in-progress">Devam Eden</option>
              <option value="completed">Tamamlanan</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tüm Öncelikler</option>
              <option value="high">Yüksek</option>
              <option value="medium">Orta</option>
              <option value="low">Düşük</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {tasksLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Görevler yükleniyor...</span>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border">
            {filteredTasks.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <div
                    key={task._id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Görev Başlığı ve Proje */}
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {task.title}
                          </h3>
                          <span className="text-sm text-gray-500">•</span>
                          <button
                            onClick={() =>
                              router.push(`/projects/${task.project?._id}`)
                            }
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {task.project?.title}
                          </button>
                        </div>

                        {/* Görev Açıklaması */}
                        {task.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Badges ve Bilgiler */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Status Badge */}
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {getStatusIcon(task.status)}
                            {getStatusText(task.status)}
                          </span>

                          {/* Priority Badge */}
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {getPriorityIcon(task.priority)}
                            {getPriorityText(task.priority)}
                          </span>

                          {/* Atanan Kişi */}
                          {task.assignedTo && (
                            <div className="flex items-center text-xs text-gray-600">
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              {task.assignedTo.name ||
                                task.assignedTo.username ||
                                task.assignedTo.email ||
                                task.assignedTo}
                            </div>
                          )}

                          {/* Tahmini Süre */}
                          {task.estimatedHours && (
                            <div className="flex items-center text-xs text-gray-600">
                              <svg
                                className="w-3 h-3 mr-1"
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
                              {task.estimatedHours}sa
                            </div>
                          )}

                          {/* Bitiş Tarihi */}
                          {task.dueDate && (
                            <div className="flex items-center text-xs text-gray-600">
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              {new Date(task.dueDate).toLocaleDateString(
                                "tr-TR"
                              )}
                            </div>
                          )}

                          {/* Oluşturulma Tarihi */}
                          {task.createdAt && (
                            <div className="flex items-center text-xs text-gray-500">
                              <svg
                                className="w-3 h-3 mr-1"
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
                              {new Date(task.createdAt).toLocaleDateString(
                                "tr-TR"
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Aksiyon Butonları */}
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() =>
                            router.push(`/projects/${task.project?._id}`)
                          }
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                          title="Proje Detayına Git"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Boş Durum */
              <div className="text-center py-12">
                <svg
                  className="w-12 h-12 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Görev bulunamadı
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filter !== "all" || priorityFilter !== "all"
                    ? "Arama kriterlerinizle eşleşen görev bulunamadı."
                    : "Henüz hiç göreviniz yok. Projelerinize görev ekleyin!"}
                </p>
                <button
                  onClick={() => router.push("/projects")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Projelere Git
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
