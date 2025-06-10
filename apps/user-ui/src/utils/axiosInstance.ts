import { apiConfig } from "@/configs/apiRoutes";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: apiConfig.baseUrl,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

const handleLogout = () => {
  if (window.location.pathname !== "/login") window.location.href = "/login";
};

const subscriberTokenRefresh = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshingSuccess = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // prevent Infinite retry loop
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscriberTokenRefresh(() => resolve(axiosInstance(originalRequest)));
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        await axios.post(
          `${apiConfig.baseUrl}${apiConfig.routes.refreshToken}`,
          {},
          {
            withCredentials: true,
          }
        );

        isRefreshing = false;
        onRefreshingSuccess();

        return axiosInstance(originalRequest);
      } catch (error) {
        isRefreshing = false;
        handleLogout();
        refreshSubscribers = [];
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
