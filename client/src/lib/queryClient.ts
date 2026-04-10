import { QueryClient, QueryFunction } from "@tanstack/react-query";

// API_BASE handles both local dev and deployed environments
const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__";

export async function apiRequest(url: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(`${API_BASE}${url}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || res.statusText);
  }
  return res;
}

const defaultQueryFn: QueryFunction = async ({ queryKey }) => {
  const res = await apiRequest(queryKey[0] as string);
  return res.json();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      refetchOnWindowFocus: false,
      staleTime: 30000,
      retry: false,
    },
  },
});
