import { API_BASE_URL } from "@/lib/constants"

interface RequestOptions {
  token?: string | null
  isFormData?: boolean
}

type ApiEnvelope<T> = {
  message?: string
  data?: T
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const { token, isFormData = false } = options

  const headers: Record<string, string> = {}

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  if (!isFormData && body !== undefined) {
    headers["Content-Type"] = "application/json"
  }

  const init: RequestInit = {
    method,
    headers,
  }

  if (body !== undefined) {
    init.body = isFormData ? (body as FormData) : JSON.stringify(body)
  }

  const res = await fetch(`${API_BASE_URL}${path}`, init)

  if (!res.ok) {
    let message = `Request failed: ${res.status} ${res.statusText}`
    try {
      const errData = await res.json()
      message = errData?.detail ?? errData?.message ?? message
    } catch {
      // ignore parse errors
    }
    throw new Error(message)
  }

  if (res.status === 204) {
    return undefined as T
  }

  const payload = (await res.json()) as T | ApiEnvelope<T>

  if (
    payload &&
    typeof payload === "object" &&
    "data" in (payload as Record<string, unknown>) &&
    (payload as ApiEnvelope<T>).data !== undefined
  ) {
    return (payload as ApiEnvelope<T>).data as T
  }

  return payload as T
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>("GET", path, undefined, options),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, body, options),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, body, options),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, body, options),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, undefined, options),
}
