import api from "./api";
import { storage } from "../utils/storage";

export const login = async (email: string, password: string) => {
  const res = await api.post("/api/auth/signin", { email, password });
  if (res.data?.token) await storage.setItem("authToken", res.data.token);
  return res.data; // { token, user }
};

export const register = async (username: string, email: string, password: string) => {
  const res = await api.post("/api/auth/signup", { username, email, password });
  if (res.data?.token) await storage.setItem("authToken", res.data.token);
  return res.data; // { token, user }
};

export const logout = async () => {
  await storage.deleteItem("authToken");
};
