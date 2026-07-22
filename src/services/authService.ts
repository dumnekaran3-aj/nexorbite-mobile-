import api from "./api";
import * as SecureStore from "expo-secure-store";

export const login = async (email: string, password: string) => {
  const res = await api.post("/api/auth/login", { email, password });
  if (res.data?.token) await SecureStore.setItemAsync("authToken", res.data.token);
  return res.data;
};

export const register = async (payload: any) => {
  const res = await api.post("/api/auth/register", payload);
  return res.data;
};

export const logout = async () => {
  await SecureStore.deleteItemAsync("authToken");
};