import api from "./api";

export const getCollegeStudents    = () => api.get("/api/ecosystem/members").then(r => r.data);
export const getSameBranchStudents = () => api.get("/api/ecosystem/members/same-branch").then(r => r.data);
export const getFriendsCount       = (page = 1, limit = 10) =>
  api.get("/api/ecosystem/friends/count", { params: { page, limit } }).then(r => r.data);
