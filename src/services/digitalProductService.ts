import api from "./api";

export const getSlotDefinitions = () =>
  api.get("/api/digital-products/slots").then((r) => r.data.data);

export const createProduct = (formData: FormData) =>
  api.post("/api/digital-products/create", formData).then((r) => r.data);