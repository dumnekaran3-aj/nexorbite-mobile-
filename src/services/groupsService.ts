import api from "./api";

export const getGroups = (collegeId?: string, filters: any = {}) =>
  api.get("/api/ecosystem/groups", { params: { ...filters, ...(collegeId ? { collegeId } : {}) } }).then((r) => r.data);

export const getMyGroups = () => api.get("/api/ecosystem/groups/my-groups").then((r) => r.data);

export const createGroup = (payload: any, collegeId?: string) =>
  api.post("/api/ecosystem/groups", { ...payload, ...(collegeId ? { collegeId } : {}) }).then((r) => r.data);

export const joinGroup = (groupId: string) => api.post(`/api/ecosystem/groups/${groupId}/join`).then((r) => r.data);

export const leaveGroup = (groupId: string) => api.post(`/api/ecosystem/groups/${groupId}/leave`).then((r) => r.data);
