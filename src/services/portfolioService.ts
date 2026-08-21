import api from "./api";

export const getMyProjects = () => api.get("/api/projects/mine").then((r) => r.data);
export const getMyDigitalProducts = () => api.get("/api/digital-products/my-products").then((r) => r.data);
