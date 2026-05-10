const API_URL = (import.meta as any).env.VITE_API_URL || "/api";

export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth:unauthorized"));
      await new Promise(() => {}); // prevent throwing error to avoid toasts before redirect
    }

    let errorMsg = "An error occurred";
    try {
      const errData = await response.json();
      errorMsg = errData.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return response.json();
};
