const API_URL = (import.meta as any).env.VITE_API_URL || "/api";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

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
    const defaultOptions = { ...options, headers };
    let response = await fetch(`${API_URL}${endpoint}`, defaultOptions);

    if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_URL}/auth/refresh`, { 
            method: 'POST',
            credentials: 'include' // Crucial to send refreshToken cookie
          });
          
          if (!refreshRes.ok) throw new Error('Refresh failed');
          const refreshData = await refreshRes.json();
          localStorage.setItem('token', refreshData.token);
          isRefreshing = false;
          onRefreshed(refreshData.token);
          
          // Retry original request 
          const newHeaders = { ...defaultOptions.headers, Authorization: `Bearer ${refreshData.token}` };
          response = await fetch(`${API_URL}${endpoint}`, { ...defaultOptions, headers: newHeaders });
        } catch (refreshErr) {
          isRefreshing = false;
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.dispatchEvent(new Event("auth:unauthorized"));
          await wait(100);
          throw new Error('Session expired. Please log in again.');
        }
      } else {
        // Wait for refresh to complete
        const newToken = await new Promise<string>(resolve => subscribeTokenRefresh(resolve));
        defaultOptions.headers = { ...defaultOptions.headers, Authorization: `Bearer ${newToken}` };
        response = await fetch(`${API_URL}${endpoint}`, defaultOptions);
      }
    }

    if (!response.ok) {
      if (response.status === 401 && endpoint !== '/auth/refresh') {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth:unauthorized"));
        await wait(100);
      }

      let errorMsg = "An unexpected error occurred. Please try again.";
      try {
        const errData = await response.json();
        errorMsg = errData.error || errData.message || errorMsg;
      } catch {}
      
      if (response.status >= 500 && retries > 0) {
        throw new Error(`RETRY: ${errorMsg}`);
      }
      
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (error: any) {
    const isNetworkError = error instanceof TypeError || error.message.startsWith('RETRY:');
    
    if (isNetworkError && retries > 0) {
      await wait(Math.pow(2, 3 - retries) * 1000); 
      return fetchWithAuth(endpoint, options, retries - 1);
    }
    
    const finalMsg = error.message.replace('RETRY: ', '');
    throw new Error(finalMsg || "Network request failed. Please check your connection.");
  }
};
