import { ApiError } from "./errors";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type ApiRequestInit = RequestInit & {
  retryOnUnauthorized?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

async function request<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const { retryOnUnauthorized = true, headers, ...rest } = init;
  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  if (response.status === 401 && retryOnUnauthorized) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return request<T>(path, { ...init, retryOnUnauthorized: false });
    }
  }

  if (!response.ok) {
    const payload = await safeJson(response);
    throw new ApiError(readErrorMessage(payload, response.statusText), response.status, payload);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await safeJson(response)) as T;
}

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.ok)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function safeJson(response: Response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function readErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string") {
    return payload.error;
  }

  return fallback || "Unexpected API error";
}

export const apiClient = {
  get: <T>(path: string, init?: ApiRequestInit) => request<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, body?: unknown, init?: ApiRequestInit) =>
    request<T>(path, {
      ...init,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown, init?: ApiRequestInit) =>
    request<T>(path, {
      ...init,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
};
