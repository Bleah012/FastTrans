export const API_BASE_URL = "http://localhost:5000/api";

export const API_ENDPOINTS = {
  requests: `${API_BASE_URL}/requests`,
  auth: {
    register: `${API_BASE_URL}/auth/register`,
    login: `${API_BASE_URL}/auth/login`,
    me: `${API_BASE_URL}/auth/me`,
  },
};
