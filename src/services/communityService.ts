import api from "./api";

export const getPublicCommunities = () => api.get("/api/public/publicmembers").then(r => r.data);
export const getPublicUsers       = () => api.get("/api/public/publicusers").then(r => r.data);
