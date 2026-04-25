import { apiClient } from "@/lib/api/client"
import type { UserPublic } from "@/store/slices/auth-slice"

export interface AuthResponse {
  access_token: string
  user: UserPublic
}

export function login(payload: { email: string; password: string }): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>("/auth/login", payload)
}

export function register(payload: {
  full_name: string
  email: string
  password: string
}): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>("/auth/register", payload)
}
