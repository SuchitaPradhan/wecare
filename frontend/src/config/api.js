const configuredBase = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export const API_BASE = configuredBase.replace(/\/$/, "");
export const SERVER_BASE = API_BASE.replace(/\/api$/, "");

async function request(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "Something went wrong");
  }

  return data;
}

export function publicFetch(endpoint, options = {}) {
  return request(`${API_BASE}${endpoint}`, options);
}

export function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  return request(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}

export function buildFileUrl(fileUrl) {
  if (!fileUrl) return "";
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  return `${SERVER_BASE}${fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`}`;
}
