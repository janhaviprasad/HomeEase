import apiClient from "./apiClient";

export const loginAdmin = (loginData) => {
  return apiClient.post("/api/auth/login",
    loginData
  );
};

/*
{
    "status": "SUCCESS",
    "data": {
        "token": "<jwt-redacted>",
        "userId": 10,
        "name": "Admin User",
        "email": "admin@homeease.com",
        "role": "ADMIN"
    }
}
*/
