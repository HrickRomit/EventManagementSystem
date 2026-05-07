import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const normalizedBaseUrl = rawBaseUrl.endsWith("/api")
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/$/, "")}/api`;

const api = axios.create({
  baseURL: normalizedBaseUrl
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem("eventsphere-token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Admin user management
export const getAdminUsers = (role = null) => {
  return api.get("/admin/users", { params: { role } });
};

export const getAdminEvents = () => {
  return api.get("/admin/events");
};

export const updateAdminUser = (userId, userData) => {
  return api.put(`/admin/users/${userId}`, userData);
};

export const deleteAdminUser = (userId) => {
  return api.delete(`/admin/users/${userId}`);
};

export default api;
