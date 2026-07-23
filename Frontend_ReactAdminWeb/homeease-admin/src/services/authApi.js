import axios from "axios";

const API = axios.create({
  baseURL: "http://172.18.3.81:8081",
});

export const loginAdmin = (loginData) => {
  return API.post("/api/auth/login",
    loginData
  );
};

/*
{
    "status": "SUCCESS",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiQURNSU4iLCJuYW1lIjoiQWRtaW4gVXNlciIsImVtYWlsIjoiYWRtaW5AaG9tZWVhc2UuY29tIiwic3ViIjoiMTAiLCJpYXQiOjE3ODE2OTY1MzEsImV4cCI6MTc4MTc4MjkzMX0.HOJaRd7f55RWLJ0ZAI2y6irCcPh0a9s6gKVv9Cy7azc",
        "userId": 10,
        "name": "Admin User",
        "email": "admin@homeease.com",
        "role": "ADMIN"
    }
}
*/
