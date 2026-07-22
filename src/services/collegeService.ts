import api from "./api";

export const createCollege   = (payload: any)        => api.post("/api/createcollege", payload).then(r => r.data);
export const joinCollege     = (invite_code: string) => api.post("/api/createcollege/join", { invite_code }).then(r => r.data);
export const getCollegeStatus= ()                    => api.get("/api/createcollege/handler").then(r => r.data);
export const getMyCollege    = ()                    => api.get("/api/createcollege/my-college").then(r => r.data);