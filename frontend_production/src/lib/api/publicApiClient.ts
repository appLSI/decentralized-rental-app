import axios from "axios";

// This client has NO interceptor attached.
export const publicApiClient = axios.create({
  baseURL: "http://localhost:8082/api",
  headers: {
    "Content-Type": "application/json",
  },
});
