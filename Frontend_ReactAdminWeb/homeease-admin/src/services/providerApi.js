import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8081",
});

export const getProviders = () =>
  API.get("/api/providers");

export const getPendingProviders = () =>
  API.get("/api/providers?pending=true");

export const approveProvider = (id) =>
  API.put(`/api/providers/${id}/approve`);