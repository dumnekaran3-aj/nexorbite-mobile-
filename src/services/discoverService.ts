import api from "./api";

export const getDiscoverFeed = (page = 1, limit = 20) =>
  api.get("/api/discover", { params: { page, limit } }).then((r) => r.data);

export const collabWith = (userId: string) => api.post(`/api/collab/${userId}`).then((r) => r.data);
export const uncollab = (userId: string) => api.delete(`/api/collab/${userId}`).then((r) => r.data);
export const getCollabStatus = (userId: string) => api.get(`/api/collab/status/${userId}`).then((r) => r.data);
