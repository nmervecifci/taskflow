"use client";

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  FolderOpen, 
  Plus, 
  ArrowRight, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  BarChart3,
  Star,
  Calendar,
  User,
  Eye
} from "lucide-react";

export default function ProjectBoard() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0
  });

  // Projeleri ve istatistikleri yükle
  useEffect(() => {
    fetchProjectsAndStats();
  }, []);

  const fetchProjectsAndStats = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // Projeleri çek
      const projectsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://taskflow-x9rq.onrender.com'}/api/projects`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        const projectsList = projectsData.projects || [];
        setProjects(projectsList.slice(0, 6)); // İlk 6 proje

        // İstatistikleri hesapla
        calculateStats(projectsList);
      } else {
        console.error('Projects fetch failed:', projectsResponse.status);
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (projectsList) => {
    const newStats = {
      totalProjects: projectsList.length,
      activeProjects: projectsList.filter(p => p.status === 'active').length,
      completedProjects: projectsList.filter(p => p.status === 'completed').length,
      totalTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      completedTasks: 0
    };

    // Görev istatistiklerini hesapla (şimdilik mock data)
    projectsList.forEach(project => {
      // Bu veriler backend'den gelecek, şimdilik örnek
      const mockTasks = Math.floor(Math.random() * 10) + 1;
      newStats.totalTasks += mockTasks;
      
      const pending = Math.floor(mockTasks * 0.4);
      const inProgress = Math.floor(mockTasks * 0.3);
      const completed = mockTasks - pending - inProgress;
      
      newStats.pendingTasks += pending;
      newStats.inProgressTasks += inProgress;
      newStats.completedTasks += completed;
    });

    setStats(newStats);
  };

  const handleCreateProject = () => {
    router.push("/projects/create");
  };

  const handleViewAllProjects = () => {
    router.push("/projects");
  };

  const handleViewProject = (projectId) => {
    router.push(`/projects/${projectId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'completed': return 'Tamamlandı';
      case 'archived': return 'Arşivlendi';
      default: return status;
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return priority;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
            Proje Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Projelerinizin genel durumu ve son aktiviteler
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleViewAllProjects}
            className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center"
          >
            <Eye className="w-4 h-4 mr-2" />
            Tüm Projeler
          </button>

          {(user?.role === "Manager" || user?.role === "Admin") && (
            <button
              onClick={handleCreateProject}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Proje
            </button>
          )}
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Proje</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600">
              {stats.activeProjects} aktif
            </span>
            <span className="text-gray-400 mx-2">•</span>
            <span className="text-blue-600">
              {stats.completedProjects} tamamlandı
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Görev</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-yellow-600">
              {stats.pendingTasks} bekliyor
            </span>
            <span className="text-gray-400 mx-2">•</span>
            <span className="text-green-600">
              {stats.completedTasks} bitti
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Devam Eden</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgressTasks}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-orange-600">
              Şu anda üzerinde çalışılan görevler
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tamamlanma</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Son Projeler */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Son Projeler</h3>
          <button
            onClick={handleViewAllProjects}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
          >
            Tümünü Görüntüle
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length > 0 ? (
              projects.map((project) => (
                <div
                  key={project._id}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => handleViewProject(project._id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </h4>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                    {project.priority === 'high' && (
                      <Star className="w-5 h-5 text-red-500 flex-shrink-0 ml-2" />
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {getStatusText(project.status)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(project.priority)}`}>
                        {getPriorityText(project.priority)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        <span className="truncate">
                          {project.owner?.name || project.owner?.email || 'Atanmamış'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{project.members?.length || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>
                        {new Date(project.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>

                    {/* Görev İlerlemesi (Mock Data) */}
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Görev İlerlemesi</span>
                        <span className="font-medium text-gray-900">
                          {Math.floor(Math.random() * 8) + 2}/{Math.floor(Math.random() * 5) + 8}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.floor(Math.random() * 60) + 20}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              /* Empty State */
              <div className="col-span-full">
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <FolderOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {user?.role === "Developer" ? "Henüz Proje Atanmamış" : "Henüz Proje Yok"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {user?.role === "Developer" 
                      ? "Manager'larınızdan size proje ataması yapmasını isteyin."
                      : "İlk projenizi oluşturarak başlayın!"
                    }
                  </p>

                  {(user?.role === "Manager" || user?.role === "Admin") && (
                    <button
                      onClick={handleCreateProject}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      İlk Projenizi Oluşturun
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Yeni Proje Oluştur Kartı - Sadece Manager/Admin için */}
            {(user?.role === "Manager" || user?.role === "Admin") && projects.length > 0 && (
              <div 
                onClick={handleCreateProject}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-300 p-6 hover:border-blue-400 transition-colors cursor-pointer group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Yeni Proje Oluştur
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Takımınız için yeni bir proje başlatın
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}