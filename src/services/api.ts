import axios from "axios";
import { storage } from "../utils/storage";

// Direct hardcoded for local testing
const LOCAL_API_URL = "http://localhost:3000";

console.log("🚀 FORCE LOCAL API URL:", LOCAL_API_URL);

const api = axios.create({
  baseURL: LOCAL_API_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await storage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.deleteItem("authToken");
    }
    return Promise.reject(error);
  }
);

export default api;