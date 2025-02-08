import axios, { AxiosInstance } from "axios";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: "https://nest-react-kanban-production.up.railway.app/",
  withCredentials: true,
});
