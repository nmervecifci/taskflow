"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
} from "../app/store/slices/taskSlice";

export default function TaskBoard({ projectId }) {
  const dispatch = useDispatch();
  const { tasks, createLoading, updateLoading, deleteLoading, error } =
    useSelector((state) => state.tasks);

  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showEditTask, setShowEditTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
    dueDate: "",
    assignedTo: "",
    estimatedHours: "",
  });

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/simple`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok && response.status === 404) {
          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
              },
            }
          );
        }

        if (response.ok) {
          const data = await response.json();
          console.log("Users loaded:", data.data);
          setUsers(data.data || []);
        } else {
          console.log("Users API failed, using fallback");
          setUsers([
            {
              _id: "507f1f77bcf86cd799439011",
              name: "Ali Veli",
              email: "ali@example.com",
            },
            {
              _id: "507f1f77bcf86cd799439012",
              name: "Ayşe Yılmaz",
              email: "ayse@example.com",
            },
            {
              _id: "507f1f77bcf86cd799439013",
              name: "Mehmet Kara",
              email: "mehmet@example.com",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        // Fallback: gerçek ObjectId formatında mock users
        setUsers([
          {
            _id: "507f1f77bcf86cd799439011",
            name: "Ali Veli",
            email: "ali@example.com",
          },
          {
            _id: "507f1f77bcf86cd799439012",
            name: "Ayşe Yılmaz",
            email: "ayse@example.com",
          },
          {
            _id: "507f1f77bcf86cd799439013",
            name: "Mehmet Kara",
            email: "mehmet@example.com",
          },
        ]);
      }
    };

    fetchUsers();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;

    const matchesAssignee =
      assigneeFilter === "all" ||
      (assigneeFilter === "unassigned" && !task.assignedTo) ||
      (task.assignedTo &&
        (task.assignedTo._id === assigneeFilter ||
          task.assignedTo === assigneeFilter));

    return matchesSearch && matchesPriority && matchesAssignee;
  });

  const columns = [
    {
      id: "pending",
      title: "Bekleyen",
      color: "bg-yellow-50 border-yellow-200",
      headerColor: "bg-yellow-100 text-yellow-800",
      tasks: filteredTasks.filter((task) => task.status === "pending"),
    },
    {
      id: "in-progress",
      title: "Devam Eden",
      color: "bg-orange-50 border-orange-200",
      headerColor: "bg-orange-100 text-orange-800",
      tasks: filteredTasks.filter((task) => task.status === "in-progress"),
    },
    {
      id: "completed",
      title: "Tamamlanan",
      color: "bg-green-50 border-green-200",
      headerColor: "bg-green-100 text-green-800",
      tasks: filteredTasks.filter((task) => task.status === "completed"),
    },
  ];

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        status: newTask.status,
        dueDate: newTask.dueDate || null,
        estimatedHours: newTask.estimatedHours
          ? parseFloat(newTask.estimatedHours)
          : null,
        assignedTo: newTask.assignedTo || null,
      };

      // Eğer assignedTo geçerli bir ObjectId değilse null yap
      if (taskData.assignedTo && taskData.assignedTo.length !== 24) {
        console.warn("Invalid ObjectId format, setting assignedTo to null");
        taskData.assignedTo = null;
      }

      console.log("Creating task with data:", taskData);

      const result = await dispatch(createTask({ projectId, taskData }));

      if (result.type === "tasks/createTask/fulfilled") {
        setShowCreateTask(false);
        resetTaskForm();
      }
    } catch (error) {
      console.error("Task creation error:", error);
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...newTask,
        dueDate: newTask.dueDate || null,
        estimatedHours: newTask.estimatedHours
          ? parseFloat(newTask.estimatedHours)
          : null,
        assignedTo: newTask.assignedTo || null,
      };

      if (taskData.assignedTo && taskData.assignedTo.length !== 24) {
        console.warn("Invalid ObjectId format, setting assignedTo to null");
        taskData.assignedTo = null;
      }

      console.log("Updating task with data:", taskData);

      const result = await dispatch(
        updateTask({
          taskId: editingTask._id,
          taskData,
        })
      );

      if (result.type === "tasks/updateTask/fulfilled") {
        setShowEditTask(false);
        setEditingTask(null);
        resetTaskForm();
      }
    } catch (error) {
      console.error("Task update error:", error);
    }
  };

  const resetTaskForm = () => {
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      dueDate: "",
      assignedTo: "",
      estimatedHours: "",
    });
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "medium",
      status: task.status || "pending",
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      assignedTo: task.assignedTo?._id || task.assignedTo || "",
      estimatedHours: task.estimatedHours || "",
    });
    setShowEditTask(true);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      console.log("🔄 Changing task status:", { taskId, newStatus });

      const result = await dispatch(
        updateTaskStatus({ taskId, status: newStatus })
      );

      console.log("✅ Status change result:", result);

      if (result.type === "tasks/updateTaskStatus/fulfilled") {
        console.log("✅ Status successfully updated");
      } else if (result.type === "tasks/updateTaskStatus/rejected") {
        console.error("❌ Status update failed:", result.payload);
      }
    } catch (error) {
      console.error("💥 Status update error:", error);
    }
  };

  // Task silme
  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Bu görevi silmek istediğinizden emin misiniz?")) {
      try {
        await dispatch(deleteTask(taskId));
      } catch (error) {
        console.error("Task deletion error:", error);
      }
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedTask && draggedTask.status !== columnId) {
      handleStatusChange(draggedTask._id, columnId);
    }

    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  // Utility functions
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

  const getUserName = (userId) => {
    const user = users.find((u) => u._id === userId);
    return user ? user.name : "Bilinmeyen";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("tr-TR");
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return (
      new Date(dueDate) < new Date() &&
      new Date(dueDate).toDateString() !== new Date().toDateString()
    );
  };

  return (
    <div className="space-y-6">
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

      {/* Header ve Filtreler */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Görev Tahtası</h2>
          <button
            onClick={() => setShowCreateTask(true)}
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
            Yeni Görev
          </button>
        </div>

        {/* Filtreler */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Arama */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Öncelik Filtresi */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">Tüm Öncelikler</option>
            <option value="high">Yüksek</option>
            <option value="medium">Orta</option>
            <option value="low">Düşük</option>
          </select>

          {/* Atanan Kişi Filtresi */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">Tüm Atamalar</option>
            <option value="unassigned">Atanmamış</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`rounded-lg border ${column.color} min-h-96 ${
              dragOverColumn === column.id ? "ring-2 ring-blue-500" : ""
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Sütun Başlığı */}
            <div
              className={`px-4 py-3 rounded-t-lg ${column.headerColor} border-b`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{column.title}</h3>
                <span className="text-sm font-medium">
                  {column.tasks.length}
                </span>
              </div>
            </div>

            {/* Görev Kartları */}
            <div className="p-4 space-y-3">
              {column.tasks.map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-all cursor-move ${
                    draggedTask && draggedTask._id === task._id
                      ? "opacity-50"
                      : ""
                  } ${isOverdue(task.dueDate) ? "border-red-300" : ""}`}
                >
                  {/* Görev Başlığı */}
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm flex-1 mr-2">
                      {task.title}
                      {isOverdue(task.dueDate) && (
                        <span className="ml-2 text-red-500">⚠️</span>
                      )}
                    </h4>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Düzenle"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Sil"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Görev Açıklaması */}
                  {task.description && (
                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {/* Görev Detayları */}
                  <div className="space-y-2">
                    {/* Öncelik ve Tahmini Süre */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {getPriorityIcon(task.priority)} {task.priority}
                      </span>
                      {task.estimatedHours && (
                        <span className="text-xs text-gray-500">
                          ⏱️ {task.estimatedHours}sa
                        </span>
                      )}
                    </div>

                    {/* Atanan Kişi */}
                    {task.assignedTo && (
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-medium text-white">
                            {(
                              task.assignedTo.name ||
                              getUserName(task.assignedTo) ||
                              "?"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600">
                          {task.assignedTo.name || getUserName(task.assignedTo)}
                        </span>
                      </div>
                    )}

                    {/* Bitiş Tarihi */}
                    {task.dueDate && (
                      <div
                        className={`flex items-center text-xs ${
                          isOverdue(task.dueDate)
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
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
                        {formatDate(task.dueDate)}
                        {isOverdue(task.dueDate) && " (Gecikti)"}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Boş Durum */}
              {column.tasks.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg
                      className="w-12 h-12 mx-auto"
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
                  </div>
                  <p className="text-gray-500 text-sm">Henüz görev yok</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Görev Oluştur/Düzenle Modal */}
      {(showCreateTask || showEditTask) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {showEditTask ? "Görevi Düzenle" : "Yeni Görev Oluştur"}
            </h3>

            <form
              onSubmit={showEditTask ? handleEditTask : handleCreateTask}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Görev Başlığı *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Öncelik
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask({ ...newTask, priority: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    value={newTask.status}
                    onChange={(e) =>
                      setNewTask({ ...newTask, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  value={newTask.assignedTo}
                  onChange={(e) =>
                    setNewTask({ ...newTask, assignedTo: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Atama Yapılmamış</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) =>
                      setNewTask({ ...newTask, dueDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tahmini Süre (saat)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={newTask.estimatedHours}
                    onChange={(e) =>
                      setNewTask({ ...newTask, estimatedHours: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (showEditTask) {
                      setShowEditTask(false);
                      setEditingTask(null);
                    } else {
                      setShowCreateTask(false);
                    }
                    resetTaskForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={createLoading || updateLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createLoading || updateLoading
                    ? "İşleniyor..."
                    : showEditTask
                    ? "Güncelle"
                    : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
