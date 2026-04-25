import { apiClient } from "@/lib/api/client"

export type UserProfile = {
  id: string
  full_name: string
  email: string
  age?: number
  height_cm?: number
  weight_kg?: number
  goal?: string
  activity_level?: string
  created_at: string
}

export type UserBadge = {
  id: string
  label: string
  description: string
  unlocked: boolean
  progress_current: number
  progress_target: number
  unlocked_at?: string | null
}

export type UserQuest = {
  id: string
  label: string
  completed: boolean
  xp: number
}

export type UserProgress = {
  level: number
  xp_total: number
  xp_into_level: number
  xp_for_next_level: number
  streak_days: number
  total_scans: number
  nutrition_ready_meals: number
  feedback_count: number
  correction_count: number
  high_confidence_scans: number
  badges: UserBadge[]
  quests: UserQuest[]
}

export function getCurrentUser(token: string): Promise<UserProfile> {
  return apiClient.get<UserProfile>("/auth/me", { token })
}

export function getUserProgress(token: string): Promise<UserProgress> {
  return apiClient.get<UserProgress>("/users/me/progress", { token })
}

export function updateProfile(
  payload: Partial<Omit<UserProfile, "id" | "email" | "created_at">>,
  token: string
): Promise<UserProfile> {
  return apiClient.patch<UserProfile>("/users/me", payload, { token })
}
