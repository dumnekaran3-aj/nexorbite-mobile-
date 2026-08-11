import api from "./api";
import { storage } from "../utils/storage";

export const login = async (email: string, password: string) => {
  const res = await api.post("/api/auth/signin", { email, password });
  if (res.data?.token) await storage.setItem("authToken", res.data.token);
  return res.data; // { token, user } OR { needsVerification: true } on 403
};

export const register = async (username: string, email: string, password: string) => {
  const res = await api.post("/api/auth/signup", { username, email, password });
  return res.data; // { success, message, user } — NO token yet
};

export const verifyEmail = async (email: string, otp: string) => {
  const res = await api.post("/api/auth/verify-email", { email, otp });
  if (res.data?.token) await storage.setItem("authToken", res.data.token);
  return res.data; // { token, user }
};

export const resendOtp = async (email: string) => {
  const res = await api.post("/api/auth/resend-otp", { email });
  return res.data;
};

export const logout = async () => {
  await storage.deleteItem("authToken");
};
