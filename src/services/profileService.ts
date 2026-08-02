import api from "./api";

export const getMyProfile = () => api.get("/api/profile/me").then((r) => r.data);

export const updateProfile = (formData: FormData) =>
  api
    .put("/api/profile/me", formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);
