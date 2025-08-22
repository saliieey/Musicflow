import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  // Handle 204 No Content responses
  if (res.status === 204) {
    return { success: true };
  }
  
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Handle different query key patterns
    let url: string;
    
    if (queryKey[0] === "/api/favorites" && queryKey[2] === "check") {
      // Handle favorites check endpoint: ["/api/favorites", trackId, "check", userId]
      const trackId = queryKey[1];
      const userId = queryKey[3];
      url = `/api/favorites/${trackId}/check?userId=${userId}`;
    } else if (queryKey[0] === "/api/favorites" && queryKey[1]) {
      // Handle favorites list endpoint: ["/api/favorites", userId]
      const userId = queryKey[1];
      url = `/api/favorites?userId=${userId}`;
    } else if (queryKey[0] === "/api/playlists" && queryKey[1] === "user" && queryKey[2]) {
      // Handle ["/api/playlists", "user", userId] - fetch user's playlists
      const userId = queryKey[2];
      url = `/api/playlists?userId=${userId}`;
    } else if (queryKey[0] === "/api/playlists" && queryKey[1] && typeof queryKey[1] === "string") {
      // Handle ["/api/playlists", playlistId] - fetch individual playlist
      const playlistId = queryKey[1];
      url = `/api/playlists/${playlistId}`;
    } else {
      // Fallback to joining with "/"
      url = queryKey.join("/") as string;
    }
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
