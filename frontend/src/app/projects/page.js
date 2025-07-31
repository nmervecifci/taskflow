"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import CreateProjectModal from "@/components/CreateProjectModal";
import ProjectActions from "@/components/ProjectActions";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import {
  fetchProjects,
  createProject,
  deleteProject,
} from "@/app/store/slices/projectSlice";

export default function ProjectsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { projects, isLoading, error } = useSelector((state) => state.projects);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { user } = useRoleAccess();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    dispatch(fetchProjects());
  }, [isAuthenticated, router, dispatch]);

  // Filtreleme logic'i
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || project.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || project.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleEditProject = (project) => {
    console.log("Edit project:", project);
  };

  const handleDeleteProject = async (project) => {
    if (
      window.confirm(
        `"${project.title}" projesini silmek istediğinizden emin misiniz?`
      )
    ) {
      try {
        await dispatch(deleteProject(project._id));
        console.log("Project deleted successfully");
      } catch (error) {
        console.error("Error deleting project:", error);
        alert("Proje silinirken bir hata oluştu");
      }
    }
  };

  const handleAddMember = (project) => {
    console.log("Add member to project:", project);
    // Member ekleme modal'ını aç
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
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

  const getRoleDescription = (role) => {
    switch (role) {
      case "Admin":
        return "Tüm projeleri görebilir ve yönetebilirsiniz";
      case "Manager":
        return "Sahip olduğunuz ve üye olduğunuz projeleri görebilirsiniz";
      case "Developer":
        return "Üye olduğunuz projeleri görebilirsiniz";
      default:
        return "";
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tüm Projeler</h1>
            <p className="text-gray-600 mt-1">
              Projelerinizi görüntüleyin ve yönetin
            </p>
          </div>

          {/* Yeni Proje Butonu - Görev taslağına göre herkes oluşturabilir */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Yeni Proje
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">❌</div>
              <div>
                <h3 className="text-red-800 font-medium">Hata</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
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
                placeholder="Projelerde ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="completed">Tamamlanan</option>
              <option value="archived">Arşivlenen</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tüm Öncelikler</option>
              <option value="high">Yüksek</option>
              <option value="medium">Orta</option>
              <option value="low">Düşük</option>
            </select>
          </div>
        </div>

        {/* User Role Info */}
        <div className="mb-4 flex items-center space-x-2 text-sm text-gray-600">
          <span>Rolünüz:</span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              user?.role === "Admin"
                ? "bg-purple-100 text-purple-800"
                : user?.role === "Manager"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {user?.role}
          </span>
          <span className="text-gray-400">|</span>
          <span>{getRoleDescription(user?.role)}</span>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Projeler yükleniyor...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div
                  key={project._id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    {/* Project Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {project.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className="space-y-3 mb-4">
                      {/* Status and Priority */}
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status === "active"
                            ? "Aktif"
                            : project.status === "completed"
                            ? "Tamamlanan"
                            : project.status === "archived"
                            ? "Arşivlenen"
                            : project.status}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            project.priority
                          )}`}
                        >
                          {project.priority === "high"
                            ? "Yüksek"
                            : project.priority === "medium"
                            ? "Orta"
                            : project.priority === "low"
                            ? "Düşük"
                            : project.priority}
                        </span>
                      </div>

                      {/* Owner */}
                      <div className="flex items-center text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 mr-2"
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
                        Sahip:{" "}
                        {project.owner?.username ||
                          project.owner?.email ||
                          "Bilinmiyor"}
                      </div>

                      {/* Members */}
                      {project.members && project.members.length > 0 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          {project.members.length} üye
                        </div>
                      )}

                      {/* Created Date */}
                      <div className="flex items-center text-sm text-gray-500">
                        <svg
                          className="w-4 h-4 mr-2"
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
                        {new Date(project.createdAt).toLocaleDateString(
                          "tr-TR"
                        )}
                      </div>

                      {/* Tags */}
                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {project.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <button
                        onClick={() => router.push(`/projects/${project._id}`)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Proje Detayına Git →
                      </button>

                      <ProjectActions
                        project={project}
                        onEdit={() => handleEditProject(project)}
                        onDelete={() => handleDeleteProject(project)}
                        onAddMember={() => handleAddMember(project)}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              /* Empty State */
              <div className="col-span-full text-center py-12">
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Proje bulunamadı
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ||
                  filterStatus !== "all" ||
                  filterPriority !== "all"
                    ? "Arama kriterlerinizle eşleşen proje bulunamadı."
                    : "Henüz hiç projeniz yok. İlk projenizi oluşturun!"}
                </p>

                {/* Create Project Button for empty state */}
                {!searchTerm &&
                  filterStatus === "all" &&
                  filterPriority === "all" && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      İlk Projenizi Oluşturun
                    </button>
                  )}
              </div>
            )}
          </div>
        )}

        {/* Create Project Modal */}
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    </DashboardLayout>
  );
}


