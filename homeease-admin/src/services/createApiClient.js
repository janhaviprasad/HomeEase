import axios from "axios";
import { clearSession } from "../utils/auth";

// Builds an axios instance carrying the shared HomeEase auth behaviour:
// attach the admin JWT to every request, and treat an auth rejection as a
// dead session. Both services are handed the same Auth-Service-issued token,
// so a rejection from either means the same thing.
//
// TODO: 401 and 403 are handled identically below. That is safe while every
// endpoint we call is admin-only — a 403 there means the token is no good.
// Reconsider if any service starts returning 403 for granular authorization
// ("you may read this but not write it"): that response means the session is
// still valid, and clearing it would log the admin out for no reason.
export function createApiClient(baseURL) {

  const client = axios.create({ baseURL });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,

    (error) => {
      const status = error.response?.status;

      if (status === 401 || status === 403) {
        clearSession();

        // Login reports its own 401 (bad credentials). Redirecting from here
        // would reload the page and swallow that message.
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
}
