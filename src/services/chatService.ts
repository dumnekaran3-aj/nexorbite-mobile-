import api from "./api";

export const getOrCreateDirectChat = (friendId: string) => api.get(`/api/ecosystem/chat/direct/${friendId}`).then(r => r.data);
export const sendMessage           = (chatId: string, text: string, replyTo?: string) =>
  api.post("/api/ecosystem/chat/send", { chatId, text, replyTo }).then(r => r.data);
export const getChatMessages       = (chatId: string, page = 1, limit = 50) =>
  api.get(`/api/ecosystem/chat/${chatId}/messages`, { params: { page, limit } }).then(r => r.data);
export const markChatSeen          = (chatId: string) => api.put(`/api/ecosystem/chat/${chatId}/seen`).then(r => r.data);
export const archiveChat           = (chatId: string) => api.put(`/api/ecosystem/chat/${chatId}/archive`).then(r => r.data);
export const deleteMessageForMe    = (messageId: string) => api.put(`/api/ecosystem/chat/messages/${messageId}/delete`).then(r => r.data);
export const deleteMessageForAll   = (messageId: string) => api.delete(`/api/ecosystem/chat/messages/${messageId}/delete-all`).then(r => r.data);
