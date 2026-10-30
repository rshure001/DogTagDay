type ApiResponse<T> = { data: T };
async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((data as { error?: string }).error || 'Search service is temporarily unavailable.');
  return { data: data as T };
}
export const api = {
  get: <T = unknown>(path: string) => request<T>(path),
  post: <T = unknown>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
};
