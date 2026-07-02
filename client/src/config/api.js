const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const API_ENDPOINTS = {
  requests: `${API_BASE_URL}/api/requests`,
  requestStatus: (requestId) =>
    `${API_BASE_URL}/api/requests/${requestId}/status`,
};
