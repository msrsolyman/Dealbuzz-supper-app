const API_URL = (import.meta as any).env.VITE_API_URL || "/api";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {},
  retries = 2
): Promise<any> => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth:unauthorized"));
        await wait(100); // prevent throwing error to avoid toasts before redirect
      }

      let errorMsg = "An unexpected error occurred. Please try again.";
      try {
        const errData = await response.json();
        errorMsg = errData.error || errData.message || errorMsg;
      } catch {}
      
      // If error is a Server Error (5xx), we could throw immediately or we will retry below if it's a catch block.
      // Actually, let's retry 5xx errors and network errors.
      if (response.status >= 500 && retries > 0) {
        throw new Error(`RETRY: ${errorMsg}`);
      }
      
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (error: any) {
    // Check if network error (fetch throws TypeError on network failure) or retryable 5xx
    const isNetworkError = error instanceof TypeError || error.message.startsWith('RETRY:');
    
    if (isNetworkError && retries > 0) {
      // Exponential backoff
      await wait(Math.pow(2, 3 - retries) * 1000); 
      return fetchWithAuth(endpoint, options, retries - 1);
    }
    
    // Clean up retry prefix if present
    const finalMsg = error.message.replace('RETRY: ', '');
    throw new Error(finalMsg || "Network request failed. Please check your connection.");
  }
};
