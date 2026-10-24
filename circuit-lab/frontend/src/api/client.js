import axios from "axios";

const client = axios.create({
  baseURL: "/api",
});

client.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("cl_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default client;
