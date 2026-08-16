
import api from "./api";

export const getGroups = (collegeId?: string, filters: any = {}) =>
  api.get("/api/ecosystem/groups", { params: { ...filters, ...(collegeId ? { collegeId } : {}) } }).then((r) => r.data);

export const getMyGroups = () => api.get("/api/ecosystem/groups/my-groups").then((r) => r.data);

export const createGroup = (payload: any, collegeId?: string) =>
  api.post("/api/ecosystem/groups", { ...payload, ...(collegeId ? { collegeId } : {}) }).then((r) => r.data);

export const uploadGroupAvatar = (groupId: string, fileUri: string) => {
  const formData = new FormData();
  formData.append("icon", { uri: fileUri, name: "group-icon.jpg", type: "image/jpeg" } as any);
  return api.post(`/api/ecosystem/groups/${groupId}/avatar`, formData).then((r) => r.data);
};

export const getGroupById = (groupId: string) => api.get(`/api/ecosystem/groups/${groupId}`).then((r) => r.data);

export const joinGroup = (groupId: string) => api.post(`/api/ecosystem/groups/${groupId}/join`).then((r) => r.data);
export const cancelJoinRequest = (groupId: string) => api.delete(`/api/ecosystem/groups/${groupId}/join`).then((r) => r.data);
export const leaveGroup = (groupId: string) => api.post(`/api/ecosystem/groups/${groupId}/leave`).then((r) => r.data);

export const getJoinRequests = (groupId: string) => api.get(`/api/ecosystem/groups/${groupId}/join-requests`).then((r) => r.data);
export const respondToJoinRequest = (groupId: string, requestId: string, action: "accept" | "decline") =>
  api.post(`/api/ecosystem/groups/${groupId}/join-requests/${requestId}/respond`, { action }).then((r) => r.data);

export const getGroupMembers = (groupId: string) => api.get(`/api/ecosystem/groups/${groupId}/members`).then((r) => r.data);
export const removeMember = (groupId: string, userId: string) => api.delete(`/api/ecosystem/groups/${groupId}/members/${userId}`).then((r) => r.data);
export const promoteToAdmin = (groupId: string, userId: string) => api.post(`/api/ecosystem/groups/${groupId}/members/${userId}/promote`).then((r) => r.data);
export const demoteAdmin = (groupId: string, userId: string) => api.post(`/api/ecosystem/groups/${groupId}/members/${userId}/demote`).then((r) => r.data);

export const getGroupMessages = (groupId: string, page = 1, limit = 50) =>
  api.get(`/api/ecosystem/groups/${groupId}/messages`, { params: { page, limit } }).then((r) => r.data);

export const sendGroupMessage = (groupId: string, text: string, replyTo?: string) =>
  api.post(`/api/ecosystem/groups/${groupId}/messages`, { text, replyTo }).then((r) => r.data);

export const sendGroupMediaMessage = (groupId: string, fileUri: string, mimeType: string, fileName: string, text?: string) => {
  const formData = new FormData();
  formData.append("file", { uri: fileUri, name: fileName, type: mimeType } as any);
  if (text?.trim()) formData.append("text", text.trim());
  return api.post(`/api/ecosystem/groups/${groupId}/messages/media`, formData).then((r) => r.data);
};

export const markGroupMessagesSeen = (groupId: string) => api.put(`/api/ecosystem/groups/${groupId}/messages/seen`).then((r) => r.data);

export const toggleMuteGroup = (groupId: string, muted: boolean) => api.put(`/api/ecosystem/groups/${groupId}/mute`, { muted }).then((r) => r.data);
export const toggleFavoriteGroup = (groupId: string, favorite: boolean) => api.put(`/api/ecosystem/groups/${groupId}/favorite`, { favorite }).then((r) => r.data);

export const reactToMessage = (groupId: string, messageId: string, emoji: string) =>
  api.put(`/api/ecosystem/groups/${groupId}/messages/${messageId}/react`, { emoji }).then((r) => r.data);

export const removeReaction = (groupId: string, messageId: string) =>
  api.delete(`/api/ecosystem/groups/${groupId}/messages/${messageId}/react`).then((r) => r.data);
