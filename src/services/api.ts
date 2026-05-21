import axios from "axios";

import { BASE_URL } from "@/constants/config";
import { getToken } from "@/utils/storage";
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});
// auto-attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
