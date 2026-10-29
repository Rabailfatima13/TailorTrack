import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export function getErrorMessage(err: unknown) {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || "Could not reach the server";
  }
  return "Something went wrong";
}

export default api;
