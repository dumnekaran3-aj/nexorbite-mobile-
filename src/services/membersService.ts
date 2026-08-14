import api from "./api";

export const getCollegeStudents = (collegeId?: string) =>
  api.get("/api/ecosystem/members", { params: collegeId ? { collegeId } : {} }).then((r) => r.data);

export const getSameBranchStudents = (collegeId?: string) =>
  api.get("/api/ecosystem/members/same-branch", { params: collegeId ? { collegeId } : {} }).then((r) => r.data);

export const getFriendsCount = (page = 1, limit = 10) =>
  api.get("/api/ecosystem/friends/count", { params: { page, limit } }).then((r) => r.data);
