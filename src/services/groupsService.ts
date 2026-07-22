import api from "./api";

export const getGroups     = (filters: any = {}) => api.get("/api/ecosystem/groups", { params: filters }).then(r => r.data);
export const getMyGroups   = ()                    => api.get("/api/ecosystem/groups/my-groups").then(r => r.data);
export const createGroup   = (payload: any)        => api.post("/api/ecosystem/groups", payload).then(r => r.data);
export const joinGroup     = (groupId: string)     => api.post(`/api/ecosystem/groups/${groupId}/join`).then(r => r.data);
export const leaveGroup    = (groupId: string)     => api.post(`/api/ecosystem/groups/${groupId}/leave`).then(r => r.data);
export const updateGroup   = (groupId: string, payload: any) => api.put(`/api/ecosystem/groups/${groupId}`, payload).then(r => r.data);
export const deleteGroup   = (groupId: string)     => api.delete(`/api/ecosystem/groups/${groupId}`).then(r => r.data);
