import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api";

const authClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

authClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  googleLogin: async (token) => {
    const response = await authClient.post('/auth/google', { token });
    return response.data;
  },

  getProfile: async () => {
    const response = await authClient.get('/auth/profile');
    return response.data;
  },
};
