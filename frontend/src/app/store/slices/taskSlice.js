import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/services/api";

// Async thunks
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (projectId, { rejectWithValue }) => {
    try {
      console.log("Fetching tasks for project:", projectId);
      const response = await apiClient.get(`/projects/${projectId}/tasks`);
      console.log("Tasks response:", response.data);

      const tasks =
        response.data.data || response.data.tasks || response.data || [];
      return Array.isArray(tasks) ? tasks : [];
    } catch (error) {
      console.error("Fetch tasks error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Görevler yüklenemedi";
      return rejectWithValue(message);
    }
  }
);

export const createTask = createAsyncThunk(
  "tasks/createTask",
  async ({ projectId, taskData }, { rejectWithValue }) => {
    try {
      console.log("Creating task:", { projectId, taskData });
      const response = await apiClient.post(`/projects/${projectId}/tasks`, {
        ...taskData,
        project: projectId,
      });
      console.log("Create task response:", response.data);

      const newTask = response.data.data || response.data.task || response.data;
      return newTask;
    } catch (error) {
      console.error("Create task error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Görev oluşturulamadı";
      return rejectWithValue(message);
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  "tasks/updateTaskStatus",
  async ({ taskId, status }, { rejectWithValue }) => {
    try {
      console.log("Updating task status:", { taskId, status });
      const response = await apiClient.put(`/tasks/${taskId}`, { status });
      console.log("Update task status response:", response.data);

      const updatedTask =
        response.data.data || response.data.task || response.data;
      return updatedTask;
    } catch (error) {
      console.error("Update task status error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Görev durumu güncellenemedi";
      return rejectWithValue(message);
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ taskId, taskData }, { rejectWithValue }) => {
    try {
      console.log("Updating task:", { taskId, taskData });
      const response = await apiClient.put(`/tasks/${taskId}`, taskData);
      console.log("Update task response:", response.data);

      const updatedTask =
        response.data.data || response.data.task || response.data;
      return updatedTask;
    } catch (error) {
      console.error("Update task error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Görev güncellenemedi";
      return rejectWithValue(message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (taskId, { rejectWithValue }) => {
    try {
      console.log("Deleting task:", taskId);
      await apiClient.delete(`/tasks/${taskId}`);
      console.log("Task deleted successfully");
      return taskId;
    } catch (error) {
      console.error("Delete task error:", error);
      const message =
        error.response?.data?.message || error.message || "Görev silinemedi";
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  tasks: [],
  isLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  error: null,
  lastFetch: null,
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTasks: (state) => {
      state.tasks = [];
    },
    // Optimistic updates
    addTaskOptimistic: (state, action) => {
      state.tasks.push(action.payload);
    },
    updateTaskOptimistic: (state, action) => {
      const index = state.tasks.findIndex(
        (task) => task._id === action.payload._id
      );
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...action.payload };
      }
    },
    removeTaskOptimistic: (state, action) => {
      state.tasks = state.tasks.filter((task) => task._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
        state.error = null;
        state.lastFetch = new Date().toISOString();
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.error("Fetch tasks rejected:", action.payload);
      })

      // Create Task
      .addCase(createTask.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.createLoading = false;
        state.tasks.push(action.payload);
        state.error = null;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
        console.error("Create task rejected:", action.payload);
      })

      // Update Task
      .addCase(updateTask.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.tasks.findIndex(
          (task) => task._id === action.payload._id
        );
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
        console.error("Update task rejected:", action.payload);
      })

      // Update Task Status
      .addCase(updateTaskStatus.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.tasks.findIndex(
          (task) => task._id === action.payload._id
        );
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
        console.error("Update task status rejected:", action.payload);
      })

      // Delete Task
      .addCase(deleteTask.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.tasks = state.tasks.filter((task) => task._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
        console.error("Delete task rejected:", action.payload);
      });
  },
});

export const {
  clearError,
  clearTasks,
  addTaskOptimistic,
  updateTaskOptimistic,
  removeTaskOptimistic,
} = taskSlice.actions;

export default taskSlice.reducer;
