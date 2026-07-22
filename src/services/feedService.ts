import api from "./api";

export const getCommunityFeed = (page = 1, limit = 20) =>
  api.get("/api/ecosystem/feed/get-feed", { params: { page, limit } }).then(r => r.data);

export const getMyPosts = (page = 1, limit = 20) =>
  api.get("/api/ecosystem/feed/my-posts", { params: { page, limit } }).then(r => r.data);
