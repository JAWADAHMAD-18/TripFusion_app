import axios from "axios";

import { BASE_URL } from "@/constants/config";
import { getToken } from "@/utils/storage";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Auto attach JWT token
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
