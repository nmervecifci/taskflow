// services/api.js
import axios from "axios";

const API_URL = "https://taskflow-x9rq.onrender.com/api";

console.log("🔍 API_URL:", API_URL); // Debug için

// Axios instance oluştur
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - her istekte token ekle
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 401 hatalarında logout
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const projectsAPI = {
  // Projeleri getir (role-based filtering backend'te yapılıyor)
  getProjects: () => apiClient.get("/projects"),

  // Tek proje getir
  getProject: (projectId) => apiClient.get(`/projects/${projectId}`),

  // Proje oluştur (herkes oluşturabilir)
  createProject: (projectData) => apiClient.post("/projects", projectData),

  // Proje güncelle (sadece sahip veya Admin)
  updateProject: (projectId, projectData) =>
    apiClient.put(`/projects/${projectId}`, projectData),

  // Proje sil (sadece sahip veya Admin)
  deleteProject: (projectId) => apiClient.delete(`/projects/${projectId}`),

  // Proje görevlerini getir
  getProjectTasks: (projectId) => apiClient.get(`/projects/${projectId}/tasks`),

  // Projeye üye ekle (Manager/Admin veya sahip)
  addProjectMember: (projectId, memberData) =>
    apiClient.post(`/projects/${projectId}/members`, memberData),

  // Projeden üye çıkar
  removeProjectMember: (projectId, userId) =>
    apiClient.delete(`/projects/${projectId}/members/${userId}`),
};

export const tasksAPI = {
  // Görevleri getir (proje bazlı)
  getTasks: (projectId) => apiClient.get(`/projects/${projectId}/tasks`),

  // Görev oluştur
  createTask: (projectId, taskData) =>
    apiClient.post(`/projects/${projectId}/tasks`, taskData),

  // Görev güncelle
  updateTask: (taskId, taskData) => apiClient.put(`/tasks/${taskId}`, taskData),

  // Görev sil
  deleteTask: (taskId) => apiClient.delete(`/tasks/${taskId}`),

  // Görev atama (Manager/Admin yetkisi gerekebilir)
  assignTask: (taskId, userId) =>
    apiClient.put(`/tasks/${taskId}/assign`, { assignedTo: userId }),
};

export const authAPI = {
  // Kullanıcı girişi
  login: (credentials) => apiClient.post("/auth/login", credentials),

  // Kullanıcı kaydı
  register: (userData) => apiClient.post("/auth/register", userData),

  // Mevcut kullanıcı bilgisi
  getCurrentUser: () => apiClient.get("/auth/me"),

  // Profil güncelle
  updateProfile: (profileData) => apiClient.put("/auth/profile", profileData),
};

export const usersAPI = {
  // Tüm kullanıcıları getir (Admin için)
  getUsers: () => apiClient.get("/users"),

  // Kullanıcı detayı
  getUser: (userId) => apiClient.get(`/users/${userId}`),

  // Kullanıcı güncelle (Admin için)
  updateUser: (userId, userData) => apiClient.put(`/users/${userId}`, userData),

  // Kullanıcı sil (Admin için)
  deleteUser: (userId) => apiClient.delete(`/users/${userId}`),
};

// Yetki kontrol yardımcı fonksiyonları
export const roleUtils = {
  // Admin kontrolü
  isAdmin: (user) => user?.role === "Admin",

  // Manager kontrolü
  isManager: (user) => user?.role === "Manager",

  // Developer kontrolü
  isDeveloper: (user) => user?.role === "Developer",

  // Manager veya Admin kontrolü
  isManagerOrAdmin: (user) => ["Manager", "Admin"].includes(user?.role),

  // Proje sahibi kontrolü
  isProjectOwner: (user, project) =>
    project?.createdBy === user?.id || project?.owner === user?.id,

  // Proje düzenleme yetkisi
  canEditProject: (user, project) =>
    roleUtils.isAdmin(user) || roleUtils.isProjectOwner(user, project),

  // Proje silme yetkisi
  canDeleteProject: (user, project) =>
    roleUtils.isAdmin(user) || roleUtils.isProjectOwner(user, project),

  // Görev atama yetkisi
  canAssignTasks: (user, project) =>
    roleUtils.isManagerOrAdmin(user) || roleUtils.isProjectOwner(user, project),

  // Kullanıcı yönetimi yetkisi
  canManageUsers: (user) => roleUtils.isAdmin(user),
};

export default apiClient;
