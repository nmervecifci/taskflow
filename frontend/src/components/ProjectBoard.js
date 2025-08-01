"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { FolderOpen, Plus, ArrowRight } from "lucide-react";

export default function ProjectBoard() {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();

  const handleCreateProject = () => {
    router.push("/projects/create");
  };

  const handleViewAllProjects = () => {
    router.push("/projects");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FolderOpen className="w-6 h-6 mr-2 text-blue-600" />
            Projelerim
          </h2>
          <p className="text-gray-600 mt-1">
            Son projeleriniz ve görevleriniz
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleViewAllProjects}
            className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center"
          >
            Tümünü Görüntüle
            <ArrowRight className="w-4 h-4 ml-2" />
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

      {/* Quick Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sample Project Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Örnek Proje
              </h3>
              <p className="text-gray-600 text-sm">
                Bu, örnek bir proje kartıdır. Gerçek projeleriniz burada görünecek.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Durum:</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Aktif
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Görevler:</span>
              <span className="text-gray-900 font-medium">0 / 0</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 mt-4">
            <button
              onClick={handleViewAllProjects}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Detayları Görüntüle →
            </button>
          </div>
        </div>

        {/* Create New Project Card - Only for Manager/Admin */}
        {(user?.role === "Manager" || user?.role === "Admin") && (
          <div 
            onClick={handleCreateProject}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-300 p-6 hover:border-blue-400 transition-colors cursor-pointer group"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Yeni Proje Oluştur
              </h3>
              <p className="text-gray-600 text-sm">
                Takımınız için yeni bir proje başlatın
              </p>
            </div>
          </div>
        )}

        {/* Getting Started Card for Developers */}
        {user?.role === "Developer" && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Projelere Katılın
              </h3>
              <p className="text-gray-600 text-sm">
                Managerlarınızdan size proje ataması yapmasını isteyin
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Son Aktiviteler
        </h3>
        <div className="space-y-3">
          <div className="text-center py-8 text-gray-500">
            <p>Henüz aktivite bulunmuyor.</p>
            <p className="text-sm mt-1">Projeleriniz ve görevlerinizle ilgili aktiviteler burada görünecek.</p>
          </div>
        </div>
      </div>
    </div>
  );
}