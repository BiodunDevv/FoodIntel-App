import type { Meal } from "@/features/meals/meals.types"

export type PredictionInput = {
  file?: File
  image_url?: string
  serving_size_g?: number
}

export type PredictionResult = {
  meal: Meal
  nutrition_available: boolean
  notes: string[]
}

export type PredictionFeedbackInput = {
  meal_id: string
  is_correct: boolean
  corrected_slug?: string
  notes?: string
}

export type PredictionFeedbackResult = {
  feedback_id: string
  meal_id: string
  status: string
  retraining_triggered: boolean
  retraining_status?: string | null
  retraining_message?: string | null
  message?: string
}
