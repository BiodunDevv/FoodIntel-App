import { apiClient } from "@/lib/api/client"
import type { Meal, MealsPayload } from "./meals.types"

export function getMeals(token: string, params?: { skip?: number; limit?: number }): Promise<MealsPayload> {
  const search = new URLSearchParams()
  if (params?.skip !== undefined) search.set("skip", String(params.skip))
  if (params?.limit !== undefined) search.set("limit", String(params.limit))
  const qs = search.toString()
  return apiClient.get<MealsPayload>(`/meals${qs ? `?${qs}` : ""}`, { token })
}

export function getMeal(id: string, token: string): Promise<Meal> {
  return apiClient.get<Meal>(`/meals/${id}`, { token })
}

export function deleteMeal(id: string, token: string): Promise<void> {
  return apiClient.delete<void>(`/meals/${id}`, { token })
}
