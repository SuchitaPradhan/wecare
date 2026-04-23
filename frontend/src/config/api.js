const configuredBase =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_BASE ||
  import.meta.env.VITE__BASE ||
  "http://localhost:5000/api";

const normalizedBase = configuredBase.replace(/\/$/, "");

export const _BASE = normalizedBase.endsWith("/api")
  ? normalizedBase
  : `${normalizedBase}/api`;
export const SERVER_BASE = _BASE.replace(/\/api$/, "");

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
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    if (!response.ok) {
      throw new Error("Server returned an invalid response. Check API base URL and backend server.");
    }

    throw new Error("Received non-JSON response from server.");
  }

  if (!response.ok) {
    throw new Error(data?.message || "Something went wrong");
  }

  return data;
}

export function publicFetch(endpoint, options = {}) {
  return request(`${_BASE}${endpoint}`, options);
}

export function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  return request(`${_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}

export const Fetch = apiFetch;

export function buildFileUrl(fileUrl) {
  if (!fileUrl) return "";
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  return `${SERVER_BASE}${fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`}`;
}
