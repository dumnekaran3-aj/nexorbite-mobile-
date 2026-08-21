import axios from "axios";
import { storage } from "../utils/storage";
import ENV from "../config/env";

console.log("API baseURL:", ENV.API_URL);

const api = axios.create({
  baseURL: ENV.API_URL,
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
