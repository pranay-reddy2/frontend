import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api";

// Create axios instance
const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;

// Export auth API directly from this file
export const authAPI = {
  googleLogin: async (token) => {
    const response = await client.post('/auth/google', { token });
    return response.data;
  },

  getProfile: async () => {
    const response = await client.get('/auth/profile');
    return response.data;
  },
};
