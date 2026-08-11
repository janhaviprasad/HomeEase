import apiClient from "./apiClient";

export const getProviders = () =>
  apiClient.get("/api/providers");

export const getPendingProviders = () =>
  apiClient.get("/api/providers?pending=true");

export const approveProvider = (id) =>
  apiClient.put(`/api/providers/${id}/approve`);
