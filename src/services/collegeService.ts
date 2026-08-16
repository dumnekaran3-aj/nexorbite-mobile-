import api from "./api";

export const createCollege = (payload: {
  college_name: string;
  college_email: string;
  university: string;
  description: string;
}) => {
  const formData = new FormData();
  formData.append("college_name", payload.college_name);
  formData.append("college_email", payload.college_email);
  formData.append("university", payload.university);
  formData.append("description", payload.description);
  formData.append("isprivate", "true");
return api.post("/api/createcollege", formData).then((r) => r.data);
};

export const joinCollege = (invite_code: string) =>
  api.post("/api/createcollege/join", { invite_code }).then((r) => r.data);

export const leaveCollege = (collegeId: string) =>
  api.post("/api/createcollege/leave", { collegeId }).then((r) => r.data);

export const getCollegeStatus = () => api.get("/api/createcollege/handler").then((r) => r.data);

export const getMyCollege = () => api.get("/api/createcollege/my-college").then((r) => r.data);

export const getCommunityInfo = (collegeId: string) =>
  api.get("/api/createcollege/my-college", { params: { collegeId } }).then((r) => r.data);

export const getMyCommunities = () => api.get("/api/createcollege/my-communities").then((r) => r.data);
