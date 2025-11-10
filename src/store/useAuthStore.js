import { create } from "zustand";
import axios from "axios";

const API_BASE_URL = "https://calendar-backend-production-d7a3.up.railway.app/api/auth";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // 🔹 Login with Google
  loginWithGoogle: async (googleToken) => {
    set({ isLoading: true, error: null });

    try {
      const res = await axios.post(`${API_BASE_URL}/google`, {
        credential: googleToken,
      });

      const data = res.data;

      if (!data?.token) {
        throw new Error("No token received from backend");
      }

      // ✅ Save JWT token in localStorage
      localStorage.setItem("token", data.token);

      // ✅ Update Zustand state
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log("✅ Logged in successfully:", data.user);
      return data;
    } catch (error) {
      console.error("❌ Login failed:", error.response?.data || error.message);

      set({
        error: error.response?.data?.error || "Login failed",
        isLoading: false,
      });

      throw error;
    }
  },

  // 🔹 Load user profile (auto-login if token exists)
  loadUser: async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      set({ isAuthenticated: false, user: null, token: null, isLoading: false });
      return;
    }

    set({ isLoading: true });

    try {
      const res = await axios.get(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({
        user: res.data,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log("✅ User loaded:", res.data);
    } catch (error) {
      console.error("❌ Failed to load user:", error);
      localStorage.removeItem("token");

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  // 🔹 Logout (clear user + token)
  logout: () => {
    console.log("🚪 Logging out...");
    localStorage.removeItem("token");

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));
