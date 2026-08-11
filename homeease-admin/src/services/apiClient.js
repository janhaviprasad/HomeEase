import { createApiClient } from "./createApiClient";

// Auth Service (port 8081): admin login, providers, users.
const apiClient = createApiClient(
  import.meta.env.VITE_API_URL
);

export default apiClient;
