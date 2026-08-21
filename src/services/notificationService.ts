import api from "./api";

export const getNotifications = (page = 1, limit = 20) =>
  api.get("/api/notifications", { params: { page, limit } }).then((r) => r.data);

export const getUnreadCount = () => api.get("/api/notifications/unread-count").then((r) => r.data);

export const markRead = (id: string) => api.put(`/api/notifications/${id}/read`).then((r) => r.data);

export const markAllRead = () => api.put("/api/notifications/read-all").then((r) => r.data);

export const deleteNotification = (id: string) => api.delete(`/api/notifications/${id}`).then((r) => r.data);
