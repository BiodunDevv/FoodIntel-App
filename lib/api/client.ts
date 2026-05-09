import { API_BASE_URL } from "@/lib/constants"

interface RequestOptions {
  token?: string | null
  isFormData?: boolean
}

type ApiEnvelope<T> = {
  message?: string
  data?: T
}

export interface ApiErrorDetail {
  code?: string
  message?: string
  top_prediction?: string
  confidence?: number
  runner_up?: string
  runner_up_confidence?: number
  margin?: number
  confidence_threshold?: number
  margin_threshold?: number
}

export class ApiError extends Error {
  status: number
  detail: ApiErrorDetail | null

  constructor(message: string, status: number, detail: ApiErrorDetail | null = null) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.detail = detail
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const { token, isFormData = false } = options

  const headers: Record<string, string> = {}
  if (token) headers["Authorization"] = `Bearer ${token}`
  if (!isFormData && body !== undefined) headers["Content-Type"] = "application/json"

  const init: RequestInit = { method, headers }
  if (body !== undefined) {
    init.body = isFormData ? (body as FormData) : JSON.stringify(body)
  }

  const res = await fetch(`${API_BASE_URL}${path}`, init)

  if (!res.ok) {
    let message = `Request failed with status ${res.status}.`
    let detail: ApiErrorDetail | null = null

    try {
      const errData = (await res.json()) as Record<string, unknown>
      const rawDetail = errData?.detail

      if (rawDetail !== null && typeof rawDetail === "object") {
        // FastAPI HTTPException with dict detail — e.g. { code, message, top_prediction, ... }
        detail = rawDetail as ApiErrorDetail
        message = detail.message ?? message
      } else if (typeof rawDetail === "string") {
        // FastAPI HTTPException with string detail
        message = rawDetail
      } else if (typeof errData?.message === "string") {
        message = errData.message
      }
    } catch {
      // response body wasn't JSON — keep generic message
    }

    throw new ApiError(message, res.status, detail)
  }

  if (res.status === 204) return undefined as T

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
  get:    <T>(path: string, options?: RequestOptions) => request<T>("GET",    path, undefined, options),
  post:   <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("POST",   path, body, options),
  put:    <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("PUT",    path, body, options),
  patch:  <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("PATCH",  path, body, options),
  delete: <T>(path: string, options?: RequestOptions) => request<T>("DELETE", path, undefined, options),
}
