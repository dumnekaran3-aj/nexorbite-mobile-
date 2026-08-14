import api from "./api";

export const sendFriendRequest = (to: string, message?: string, collegeId?: string) =>
  api.post("/api/ecosystem/friends/request", { to, message, ...(collegeId ? { collegeId } : {}) }).then((r) => r.data);

export const getIncomingRequests = () => api.get("/api/ecosystem/friends/requests/incoming").then((r) => r.data);
export const getOutgoingRequests = () => api.get("/api/ecosystem/friends/requests/outgoing").then((r) => r.data);
export const acceptFriendRequest = (requestId: string) => api.post("/api/ecosystem/friends/accept", { requestId }).then((r) => r.data);
export const declineFriendRequest = (requestId: string) => api.post("/api/ecosystem/friends/decline", { requestId }).then((r) => r.data);

export const getFriends = (collegeId?: string) =>
  api.get("/api/ecosystem/friends", { params: collegeId ? { collegeId } : {} }).then((r) => r.data);

export const removeFriend = (friendId: string) => api.delete(`/api/ecosystem/friends/${friendId}`).then((r) => r.data);
export const checkFriendshipStatus = (userId: string) => api.get(`/api/ecosystem/friends/status/${userId}`).then((r) => r.data);
export const blockUser = (userId: string) => api.post("/api/ecosystem/friends/block", { userId }).then((r) => r.data);
export const unblockUser = (userId: string) => api.post("/api/ecosystem/friends/unblock", { userId }).then((r) => r.data);
export const getPublicProfile = (id: string) => api.get(`/api/ecosystem/friends/public-profile/${id}`).then((r) => r.data);
