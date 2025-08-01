"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Search,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  User,
  Crown,
  Shield,
} from "lucide-react";
// TEST COMMENT FOR GIT
import apiClient from "@/services/api";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();

  // Geçici çözüm: window.location'dan ID al
  const getProjectId = () => {
    if (typeof window !== "undefined") {
      return window.location.pathname.split("/")[2];
    }
    return null;
  };

  const projectId = params.id || getProjectId();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("Tüm Öncelikler");
  const [statusFilter, setStatusFilter] = useState("Tüm Atamalar");
  const [currentUser, setCurrentUser] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);

  const translateStatus = (status) => {
    const statusMap = {
      pending: "Bekleyen",
      "in-progress": "Devam Eden",
      completed: "Tamamlanan",
    };
    return statusMap[status] || status;
  };

  const reverseTranslateStatus = (status) => {
    const statusMap = {
      Bekleyen: "pending",
      "Devam Eden": "in-progress",
      Tamamlanan: "completed",
    };
    return statusMap[status] || status;
  };

  useEffect(() => {
    console.log("params.id:", params.id);
    console.log("projectId:", projectId);
    console.log("Full params:", params);

    if (!projectId) {
      console.error("Project ID bulunamadı!");
      setError("Proje ID bulunamadı");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Giriş yapmanız gerekiyor");
      router.push("/login");
      return;
    }

    fetchCurrentUser();
    fetchProjectDetails();
    fetchTasks();
  }, [projectId]);

  const fetchCurrentUser = async () => {
    try {
      // Önce localStorage'dan kullanıcı bilgilerini al
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        return;
      }

      // apiClient'den al
      const response = await apiClient.get("/auth/me");
      setCurrentUser(response.data.data || response.data);
    } catch (error) {
      console.error("Kullanıcı bilgileri alınamadı:", error);
      // Fallback: localStorage'dan al
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
        }
      } catch (e) {
        console.error("localStorage'dan kullanıcı alınamadı:", e);
      }
    }
  };

  const fetchProjectDetails = async () => {
    try {
      // Token kontrolü
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Giriş yapmanız gerekiyor");
        return;
      }

      // Mevcut apiClient client'ı kullan - token otomatik eklenir
      const response = await apiClient.get(`/projects/${params.id}`);
      setProject(response.data.data || response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Giriş yapmanız gerekiyor - Token geçersiz");
        // Login sayfasına yönlendir
        router.push("/login");
      } else {
        setError(error.response?.data?.message || "Proje bulunamadı");
      }
    }
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("Token yok - boş görev listesi gösterilecek");
        setTasks([]);
        return;
      }

      console.log("Görevler getiriliyor, proje ID:", params.id);
      const response = await apiClient.get(`/projects/${params.id}/tasks`);
      const tasks = response.data.data || response.data;

      console.log("Backend'den gelen görevler:", tasks);

      // Status'ları Türkçe'ye çevir
      const translatedTasks = Array.isArray(tasks)
        ? tasks.map((task) => ({
            ...task,
            status: translateStatus(task.status),
          }))
        : [];

      setTasks(translatedTasks);
    } catch (error) {
      console.error("Görevler yüklenirken hata:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      // Detaylı hata mesajı
      if (error.response?.status === 401) {
        console.log("Token geçersiz - login sayfasına yönlendirilecek");
        setError("Giriş token'ınız geçersiz, lütfen tekrar giriş yapın");
      } else if (error.response?.status === 403) {
        const errorMsg =
          error.response?.data?.message || "Bu projeye erişim yetkiniz yok";
        setError(`Yetki hatası: ${errorMsg}`);
        console.log(
          "403 Hatası - Kullanıcı bu projeye erişim yetkisine sahip değil"
        );
      } else if (error.response?.status === 404) {
        console.log("404 - Endpoint bulunamadı veya proje mevcut değil");
        setTasks([]); // Boş liste göster
      } else {
        console.error(
          "Bilinmeyen apiClient Hatası:",
          error.response?.data || error.message
        );
        setTasks([]); // Boş liste göster
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";

    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
    setDraggedTask(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();

    if (!draggedTask || draggedTask.status === newStatus) {
      return;
    }

    // Optimistic update - UI'ı hemen güncelle
    const updatedTasks = tasks.map((task) =>
      task._id === draggedTask._id ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);

    try {
      await updateTaskStatus(draggedTask._id, newStatus);
      console.log(
        `Görev ${draggedTask.title} durumu ${newStatus} olarak güncellendi`
      );
    } catch (error) {
      console.error("Görev durumu güncellenirken hata:", error);

      const revertedTasks = tasks.map((task) =>
        task._id === draggedTask._id
          ? { ...task, status: draggedTask.status }
          : task
      );
      setTasks(revertedTasks);

      alert("Görev durumu güncellenirken bir hata oluştu");
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const statusInEnglish = reverseTranslateStatus(newStatus);

      const response = await apiClient.put(
        `/projects/${projectId}/tasks/${taskId}`,
        {
          status: statusInEnglish,
        }
      );

      return response.data;
    } catch (error) {
      // 404 hatası alırsa (endpoint yoksa) sadece console'a log et
      if (error.response?.status === 404) {
        console.log(
          "Backend endpoint bulunamadı - sadece frontend'de güncellendi"
        );
        return;
      }
      throw error;
    }
  };

  // Rol bazlı yetki kontrolleri
  const canCreateTask = () => {
    if (!currentUser || !project) return false;
    return (
      currentUser.role === "Admin" ||
      currentUser.role === "Manager" ||
      project.owner === currentUser._id ||
      project.members?.includes(currentUser._id)
    );
  };

  const canManageProject = () => {
    if (!currentUser || !project) return false;
    return currentUser.role === "Admin" || project.owner === currentUser._id;
  };

  const canMoveTask = (task) => {
    if (!currentUser) return false;
    return (
      currentUser.role === "Admin" ||
      currentUser.role === "Manager" ||
      task.createdBy === currentUser._id ||
      task.assignedTo?._id === currentUser._id ||
      project?.owner === currentUser._id
    );
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "Admin":
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case "Manager":
        return <Shield className="w-4 h-4 text-blue-600" />;
      case "Developer":
        return <User className="w-4 h-4 text-green-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const createNewTask = async (taskData) => {
    try {
      console.log("Görev oluşturuluyor:", taskData);

      // Backend'e göndereceğimiz data'yı hazırla
      const taskPayload = {
        ...taskData,
        status: reverseTranslateStatus(taskData.status), // Status'u çevir
        createdBy: currentUser?._id || currentUser?.id, // Fallback ekle
        project: projectId,
      };

      console.log("currentUser:", currentUser);
      console.log("Backend'e gönderilen data:", taskPayload);

      const response = await apiClient.post(
        `/projects/${projectId}/tasks`,
        taskPayload
      );
      const newTask = response.data.data || response.data;

      console.log("Backend'den gelen response:", newTask);

      // Yeni görevi listeye ekle
      setTasks((prev) => [
        {
          ...newTask,
          status: translateStatus(newTask.status),
        },
        ...prev,
      ]);

      setShowTaskModal(false);
      alert("Görev başarıyla oluşturuldu!");
    } catch (error) {
      console.error("Görev oluşturma hatası:", error);
      console.error("Error response:", error.response?.data);

      if (error.response?.status === 401) {
        alert("Giriş yapmanız gerekiyor");
        router.push("/login");
      } else if (error.response?.status === 403) {
        alert("Bu projeye görev ekleme yetkiniz yok");
      } else if (error.response?.status === 404) {
        // 404 hatası alırsa, lokal olarak ekle (test amaçlı)
        const newTask = {
          _id: Date.now().toString(),
          title: taskData.title,
          description: taskData.description,
          status: taskData.status, // Zaten çevrilmiş
          priority: taskData.priority,
          assignedTo: taskData.assignedTo
            ? {
                _id: taskData.assignedTo,
                name: "Test User",
              }
            : null,
          createdBy: currentUser?._id,
          dueDate: taskData.dueDate,
          createdAt: new Date().toISOString(),
        };

        setTasks((prev) => [newTask, ...prev]);
        setShowTaskModal(false);

        alert("Backend endpoint bulunamadı - Görev yerel olarak eklendi");
      } else {
        alert(
          `Görev oluşturulurken hata: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Bekleyen":
        return "bg-yellow-100 text-yellow-800";
      case "Devam Eden":
        return "bg-orange-100 text-orange-800";
      case "Tamamlanan":
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "Bekleyen":
        return <Clock className="w-4 h-4" />;
      case "Devam Eden":
        return <AlertTriangle className="w-4 h-4" />;
      case "Tamamlanan":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority =
      priorityFilter === "Tüm Öncelikler" ||
      getPriorityText(task.priority) === priorityFilter;

    const matchesStatus =
      statusFilter === "Tüm Atamalar" || task.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const taskStats = {
    total: tasks.length,
    bekleyen: tasks.filter((t) => t.status === "Bekleyen").length,
    devamEden: tasks.filter((t) => t.status === "Devam Eden").length,
    tamamlanan: tasks.filter((t) => t.status === "Tamamlanan").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-lg inline-block">
            <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <h2 className="text-lg font-semibold text-red-800 mb-2">Hata</h2>
            <p className="text-red-600">{error}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  {project?.title || "Proje Detayı"}
                  {currentUser && project && (
                    <span className="ml-3 flex items-center space-x-2">
                      {getRoleIcon(currentUser.role)}
                      <span className="text-sm text-gray-600">
                        ({currentUser.role})
                      </span>
                    </span>
                  )}
                </h1>
                <p className="text-gray-600 mt-1">
                  {project?.description || "Proje açıklaması"}
                </p>
                {project?.owner && (
                  <p className="text-sm text-gray-500 mt-2">
                    Proje Sahibi: {project.owner.name || project.owner.username}
                  </p>
                )}
              </div>
            </div>
            {canManageProject() && (
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
                  <Edit className="w-4 h-4" />
                  <span>Düzenle</span>
                </button>
                <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center space-x-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Sil</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Toplam Görev
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {taskStats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bekleyen</p>
                <p className="text-2xl font-bold text-gray-900">
                  {taskStats.bekleyen}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Devam Eden</p>
                <p className="text-2xl font-bold text-gray-900">
                  {taskStats.devamEden}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tamamlanan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {taskStats.tamamlanan}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Görev Tahtası */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Görev Tahtası
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (Görevleri sürükleyerek taşıyabilirsiniz)
                </span>
              </h2>
              {canCreateTask() && (
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Görev</span>
                </button>
              )}
            </div>
          </div>

          {/* Filtreler */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Görevlerde ara..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option>Tüm Öncelikler</option>
                <option>Yüksek</option>
                <option>Orta</option>
                <option>Düşük</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>Tüm Atamalar</option>
                <option>Bekleyen</option>
                <option>Devam Eden</option>
                <option>Tamamlanan</option>
              </select>
            </div>
          </div>

          {/* Görev Kolonları */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bekleyen */}
              <div
                className="bg-yellow-50 rounded-lg p-4 min-h-[400px]"
                onDrop={(e) => handleDrop(e, "Bekleyen")}
                onDragOver={handleDragOver}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-yellow-800 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Bekleyen
                  </h3>
                  <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
                    {
                      filteredTasks.filter((t) => t.status === "Bekleyen")
                        .length
                    }
                  </span>
                </div>
                <div className="space-y-3">
                  {filteredTasks.filter((t) => t.status === "Bekleyen")
                    .length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        📋
                      </div>
                      <p>Henüz görev yok</p>
                      <p className="text-xs mt-1">
                        Görevleri buraya sürükleyin
                      </p>
                    </div>
                  ) : (
                    filteredTasks
                      .filter((t) => t.status === "Bekleyen")
                      .map((task) => (
                        <TaskCard
                          key={task._id}
                          task={task}
                          currentUser={currentUser}
                          projectOwner={project?.owner?._id || project?.owner}
                          canMove={canMoveTask(task)}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                        />
                      ))
                  )}
                </div>
              </div>

              {/* Devam Eden */}
              <div
                className="bg-orange-50 rounded-lg p-4 min-h-[400px]"
                onDrop={(e) => handleDrop(e, "Devam Eden")}
                onDragOver={handleDragOver}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-orange-800 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Devam Eden
                  </h3>
                  <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                    {
                      filteredTasks.filter((t) => t.status === "Devam Eden")
                        .length
                    }
                  </span>
                </div>
                <div className="space-y-3">
                  {filteredTasks.filter((t) => t.status === "Devam Eden")
                    .length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        📋
                      </div>
                      <p>Henüz görev yok</p>
                      <p className="text-xs mt-1">
                        Görevleri buraya sürükleyin
                      </p>
                    </div>
                  ) : (
                    filteredTasks
                      .filter((t) => t.status === "Devam Eden")
                      .map((task) => (
                        <TaskCard
                          key={task._id}
                          task={task}
                          currentUser={currentUser}
                          projectOwner={project?.owner?._id || project?.owner}
                          canMove={canMoveTask(task)}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                        />
                      ))
                  )}
                </div>
              </div>

              {/* Tamamlanan */}
              <div
                className="bg-green-50 rounded-lg p-4 min-h-[400px]"
                onDrop={(e) => handleDrop(e, "Tamamlanan")}
                onDragOver={handleDragOver}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-green-800 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Tamamlanan
                  </h3>
                  <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                    {
                      filteredTasks.filter((t) => t.status === "Tamamlanan")
                        .length
                    }
                  </span>
                </div>
                <div className="space-y-3">
                  {filteredTasks.filter((t) => t.status === "Tamamlanan")
                    .length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        📋
                      </div>
                      <p>Henüz görev yok</p>
                      <p className="text-xs mt-1">
                        Görevleri buraya sürükleyin
                      </p>
                    </div>
                  ) : (
                    filteredTasks
                      .filter((t) => t.status === "Tamamlanan")
                      .map((task) => (
                        <TaskCard
                          key={task._id}
                          task={task}
                          currentUser={currentUser}
                          projectOwner={project?.owner?._id || project?.owner}
                          canMove={canMoveTask(task)}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                        />
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Görev Oluşturma Modal */}
      {showTaskModal && (
        <TaskCreateModal
          projectId={params.id}
          onClose={() => setShowTaskModal(false)}
          onTaskCreated={createNewTask}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}

// Görev Oluşturma Modal Componenti
function TaskCreateModal({ projectId, onClose, onTaskCreated, currentUser }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
    assignedTo: "",
    dueDate: "",
  });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Proje üyelerini getir (görev atamak için)
    fetchProjectMembers();
  }, []);

  const fetchProjectMembers = async () => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/members`);
      const data = response.data.data || response.data;

      // Owner ve members'ı birleştir
      const allMembers = [];
      if (data.owner) allMembers.push(data.owner);
      if (data.members) allMembers.push(...data.members);

      setAvailableUsers(allMembers);
    } catch (error) {
      console.error("Proje üyeleri getirilemedi:", error);
      // 404 hatası alırsa, proje bilgisinden üyeleri kullan
      if (error.response?.status === 404) {
        // Global project state'den kullanıcıları al
        const dummyUsers = [{ _id: "current", name: "Ben", role: "Developer" }];
        setAvailableUsers(dummyUsers);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const taskData = {
        ...formData,
        createdBy: currentUser._id,
        project: projectId,
      };

      await onTaskCreated(taskData);
    } catch (error) {
      console.error("Görev oluşturma hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Yeni Görev Oluştur</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Görev Başlığı *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Görev başlığını girin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Görev açıklamasını girin"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Öncelik
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durum
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Bekleyen</option>
                <option value="in-progress">Devam Eden</option>
                <option value="completed">Tamamlanan</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Atanan Kişi
            </label>
            <select
              value={formData.assignedTo}
              onChange={(e) =>
                setFormData({ ...formData, assignedTo: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Atanmamış</option>
              {availableUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name || user.username} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bitiş Tarihi
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Oluşturuluyor..." : "Görev Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  currentUser,
  projectOwner,
  canMove,
  onDragStart,
  onDragEnd,
}) {
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

  // Görev düzenleme yetkisi kontrolü
  const canEditTask = () => {
    if (!currentUser) return false;
    return (
      currentUser.role === "Admin" ||
      currentUser.role === "Manager" ||
      task.createdBy === currentUser._id ||
      task.assignedTo?._id === currentUser._id ||
      projectOwner === currentUser._id
    );
  };

  // Görev silme yetkisi kontrolü
  const canDeleteTask = () => {
    if (!currentUser) return false;
    return (
      currentUser.role === "Admin" ||
      currentUser.role === "Manager" ||
      task.createdBy === currentUser._id ||
      projectOwner === currentUser._id
    );
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all ${
        canMove ? "cursor-move" : "cursor-default"
      } select-none`}
      draggable={canMove}
      onDragStart={(e) => canMove && onDragStart(e, task)}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 line-clamp-2">{task.title}</h4>
        <div className="flex space-x-1 ml-2">
          {canEditTask() && (
            <button className="p-1 hover:bg-gray-100 rounded">
              <Edit className="w-3 h-3 text-gray-400" />
            </button>
          )}
          {canDeleteTask() && (
            <button className="p-1 hover:bg-gray-100 rounded">
              <Trash2 className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mb-3">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
            task.priority
          )}`}
        >
          {getPriorityText(task.priority)}
        </span>

        {task.dueDate && (
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{new Date(task.dueDate).toLocaleDateString("tr-TR")}</span>
          </div>
        )}
      </div>

      {task.assignedTo && (
        <div className="flex items-center pt-3 border-t border-gray-100">
          <Users className="w-3 h-3 text-gray-400 mr-1" />
          <span className="text-xs text-gray-600">
            Sahip: {task.assignedTo.name || task.assignedTo.email}
          </span>
        </div>
      )}

      {canMove && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-400">
            <span>Sürükleyerek taşıyabilirsiniz</span>
          </div>
        </div>
      )}
    </div>
  );
}
