import axios from "axios";

const apiClient = axios.create({
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    if (
      error.response.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url == "/api/refresh"
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await apiClient.post("/api/refresh");
      return apiClient({
        ...originalRequest,
        withCredentials: true,
      });
    } catch (refreshErr) {
      localStorage.clear();
      return Promise.reject(refreshErr);
    }
  },
);

export { apiClient };
