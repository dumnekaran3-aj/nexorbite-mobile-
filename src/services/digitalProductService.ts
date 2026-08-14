import api from "./api";

export const getSlotDefinitions = () =>
  api.get("/api/digital-products/slots").then((r) => r.data.data);

export const createProduct = (formData: FormData) =>
  api
    .post("/api/digital-products/create", formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);

export const getMyProducts = () => api.get("/api/digital-products/my-products").then((r) => r.data);
