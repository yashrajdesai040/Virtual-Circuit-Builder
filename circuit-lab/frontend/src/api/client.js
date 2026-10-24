import axios from "axios";

const client = axios.create({
  baseURL: "/api",
});

client.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("cl_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

client.interceptors.response.use(
  (response) => {
    // If static hosting (Vercel / GitHub Pages) rewrote an API route to index.html
    if (
      typeof response.data === "string" &&
      (response.data.trim().startsWith("<!doctype html") ||
        response.data.trim().startsWith("<!DOCTYPE html") ||
        response.data.trim().startsWith("<html"))
    ) {
      const err = new Error("API endpoint not available on static host");
      err.response = {
        status: 404,
        statusText: "Not Found",
        data: { error: "API endpoint not available on static host" },
      };
      return Promise.reject(err);
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export default client;
