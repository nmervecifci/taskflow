import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { projectsAPI } from "@/services/api";

// Async thunks
export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Redux fetchProjects: Starting API call...");
      const response = await projectsAPI.getProjects();
      console.log("Redux fetchProjects: API response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("Redux fetchProjects: Error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Projeler yüklenemedi"
      );
    }
  }
);

export const createProject = createAsyncThunk(
  "projects/createProject",
  async (projectData, { rejectWithValue, getState }) => {
    try {
      // Get the current user from auth state
      const state = getState();
      console.log("Full Redux state:", state);
      console.log("Auth state:", state.auth);

      const currentUser = state.auth.user;
      console.log("Current user from Redux:", currentUser);

      if (!currentUser) {
        console.error("No current user found in Redux state");
        return rejectWithValue("Kullanıcı oturumu bulunamadı");
      }

      // Log the user ID
      const userId = currentUser._id || currentUser.id;
      console.log("User ID to use as owner:", userId);

      // Add owner to project data
      const projectDataWithOwner = {
        ...projectData,
        owner: userId,
      };

      console.log("Original project data:", projectData);
      console.log("Project data with owner:", projectDataWithOwner);

      const response = await projectsAPI.createProject(projectDataWithOwner);
      return response.data.data;
    } catch (error) {
      console.error("Create project error:", error);
      console.error("Error response data:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Proje oluşturulamadı"
      );
    }
  }
);

export const updateProject = createAsyncThunk(
  "projects/updateProject",
  async ({ projectId, projectData }, { rejectWithValue }) => {
    try {
      const response = await projectsAPI.updateProject(projectId, projectData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Proje güncellenemedi"
      );
    }
  }
);

export const deleteProject = createAsyncThunk(
  "projects/deleteProject",
  async (projectId, { rejectWithValue }) => {
    try {
      await projectsAPI.deleteProject(projectId);
      return projectId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Proje silinemedi"
      );
    }
  }
);

export const fetchProjectTasks = createAsyncThunk(
  "projects/fetchProjectTasks",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await projectsAPI.getProjectTasks(projectId);
      return { projectId, tasks: response.data.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Görevler yüklenemedi"
      );
    }
  }
);

// Initial state
const initialState = {
  projects: [],
  currentProject: null,
  projectTasks: {},
  isLoading: false,
  error: null,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
};

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    // Optimistic update için
    addProjectOptimistic: (state, action) => {
      state.projects.unshift(action.payload);
    },
    updateProjectOptimistic: (state, action) => {
      const index = state.projects.findIndex(
        (p) => p._id === action.payload._id
      );
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Projects
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Create Project
    builder
      .addCase(createProject.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.createLoading = false;
        state.projects.unshift(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      });

    // Update Project
    builder
      .addCase(updateProject.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.projects.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (
          state.currentProject &&
          state.currentProject._id === action.payload._id
        ) {
          state.currentProject = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      });

    // Delete Project
    builder
      .addCase(deleteProject.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.projects = state.projects.filter((p) => p._id !== action.payload);
        if (
          state.currentProject &&
          state.currentProject._id === action.payload
        ) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });

    // Fetch Project Tasks
    builder
      .addCase(fetchProjectTasks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProjectTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projectTasks[action.payload.projectId] = action.payload.tasks;
      })
      .addCase(fetchProjectTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setCurrentProject,
  clearCurrentProject,
  addProjectOptimistic,
  updateProjectOptimistic,
} = projectSlice.actions;

export default projectSlice.reducer;


