import { apiClient } from "./client";
import type { AuthSessionDto, LoginPayload, RegisterPayload } from "./types";

type AuthResponse = {
  ok?: boolean;
  user: AuthSessionDto["user"];
  tenant?: AuthSessionDto["tenant"];
};

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient.post<AuthResponse>("/api/auth/register", payload),
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>("/api/auth/login", payload),
  logout: () =>
    apiClient.post<{ ok: true }>("/api/auth/logout"),
  me: () =>
    apiClient.get<AuthSessionDto>("/api/auth/me"),
  refresh: () =>
    apiClient.post<{ ok: true }>("/api/auth/refresh", undefined, {
      retryOnUnauthorized: false,
    }),
};
