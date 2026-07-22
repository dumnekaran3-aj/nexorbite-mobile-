import axios from "axios";
import * as SecureStore from "expo-secure-store";
import ENV from "../config/env";

const api = axios.create({
  baseURL: ENV.API_URL,
  timeout: 15000,
});

// Har request ke saath JWT automatically attach ho jaayega
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 aane pe token clear — login screen redirect authStore se wire hoga
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync("authToken");
    }
    return Promise.reject(error);
  }
);

export default api;