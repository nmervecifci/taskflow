import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/services/api";

// Login action
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log("🚀 Login attempt:", { email });
      const response = await apiClient.post("/auth/login", { email, password });

      console.log("📥 Login response:", response.data);

      // ✅ DÜZELTME: Backend response formatını esnek parse et
      const responseData = response.data;

      let token, user;

      // Backend farklı formatlar gönderebilir:
      if (responseData.data) {
        // Format 1: {success: true, data: {token, user}}
        token = responseData.data.token;
        user = responseData.data.user;
        console.log("📦 Parsing from data object");
      } else {
        // Format 2: {token, user} direkt
        token = responseData.token;
        user = responseData.user;
        console.log("📦 Parsing from root object");
      }

      console.log("🔑 Parsed token:", token ? "EXISTS" : "MISSING");
      console.log(
        "👤 Parsed user:",
        user ? user.email || user.username : "MISSING"
      );

      // Validation
      if (!token) {
        throw new Error("Token missing in response");
      }
      if (!user) {
        throw new Error("User data missing in response");
      }

      // localStorage'a kaydet
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("✅ Token and user saved to localStorage");
      console.log("🎯 Login successful!");

      return { token, user };
    } catch (error) {
      console.error("❌ Login error:", error);
      console.error("📄 Error response:", error.response?.data);

      const message =
        error.response?.data?.message || error.message || "Giriş başarısız";
      return rejectWithValue(message);
    }
  }
);

// Register action
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      console.log("🚀 Register attempt:", userData);
      const response = await apiClient.post("/auth/register", userData);

      console.log("📥 Register response:", response.data);

      // ✅ DÜZELTME: Register için de esnek parsing
      const responseData = response.data;

      let token, user;

      if (responseData.data) {
        token = responseData.data.token;
        user = responseData.data.user;
      } else {
        token = responseData.token;
        user = responseData.user;
      }

      console.log("🔑 Register token:", token ? "EXISTS" : "MISSING");
      console.log(
        "👤 Register user:",
        user ? user.email || user.username : "MISSING"
      );

      if (!token || !user) {
        throw new Error("Token or user missing in register response");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("✅ Register: Token and user saved");

      return { token, user };
    } catch (error) {
      console.error("❌ Register error:", error);
      const message =
        error.response?.data?.message || error.message || "Kayıt başarısız";
      return rejectWithValue(message);
    }
  }
);

export const loadUserFromStorage = createAsyncThunk(
  "auth/loadUserFromStorage",
  async (_, { rejectWithValue }) => {
    try {
      console.log("📂 Loading user from localStorage...");

      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      console.log("🔍 Storage check:", {
        token: token ? "EXISTS" : "MISSING",
        user: userStr ? "EXISTS" : "MISSING",
      });

      if (!token || !userStr) {
        console.log("⚠️ No stored auth data found");
        return rejectWithValue("No stored auth data");
      }

      const user = JSON.parse(userStr);
      console.log("👤 Loaded user from storage:", {
        email: user.email || user.username,
        role: user.role,
        id: user._id || user.id,
      });

      console.log("✅ Successfully loaded from storage");

      return { token, user };
    } catch (error) {
      console.error("❌ Error loading user from storage:", error);

      // Corrupt data'yı temizle
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      return rejectWithValue("Invalid stored auth data");
    }
  }
);

const initialState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  isInitialized: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Logout action
    logout: (state) => {
      console.log("🚪 Logging out user...");

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Reset state
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.isInitialized = true;

      console.log("✅ Logout complete");
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Set loading
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    // Manual token/user set (for testing)
    setAuthData: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      state.isInitialized = true;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        console.log("⏳ Login pending...");
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log("✅ Login fulfilled:", {
          hasToken: !!action.payload.token,
          hasUser: !!action.payload.user,
        });

        state.isLoading = false;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.log("❌ Login rejected:", action.payload);

        state.isLoading = false;
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        console.log("⏳ Register pending...");
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        console.log("✅ Register fulfilled");

        state.isLoading = false;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        console.log("❌ Register rejected:", action.payload);

        state.isLoading = false;
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      });

    // Load from storage
    builder
      .addCase(loadUserFromStorage.pending, (state) => {
        console.log("⏳ Loading from storage...");
        state.isLoading = true;
      })
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        console.log("✅ Storage load fulfilled");

        state.isLoading = false;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loadUserFromStorage.rejected, (state, action) => {
        console.log("⚠️ Storage load rejected (normal):", action.payload);

        state.isLoading = false;
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.user = null;
        state.token = null;
        state.error = null; // Storage error normal
      });
  },
});

export const { logout, clearError, setLoading, setAuthData } =
  authSlice.actions;
export default authSlice.reducer;
