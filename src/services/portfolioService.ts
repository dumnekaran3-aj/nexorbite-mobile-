import api from "./api";

export const getMyProjects = () => api.get("/api/projects/mine").then((r) => r.data);
export const getMyDigitalProducts = () => api.get("/api/digital-products/my-products").then((r) => r.data);

export const getUserProjects = (userId: string, limit = 12) =>
  api.get("/api/projects", { params: { owner: userId, limit } }).then((r) => r.data);

export const getUserProducts = (userId: string, limit = 12) =>
  api.get("/api/digital-products/all", { params: { seller: userId, limit } }).then((r) => r.data);
