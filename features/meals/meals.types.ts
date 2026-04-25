export type Nutrition = {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
}

export type MealFeedback = {
  is_correct: boolean
  status: string
  corrected_slug: string
  corrected_food: string
  notes?: string | null
  submitted_at: string
}

export type Meal = {
  id: string
  user_id: string
  food_id?: string | null
  predicted_food: string
  predicted_slug?: string
  confidence: number
  nutrition: Nutrition
  health_score: number
  serving_size_g: number
  image_url: string
  recommendations: string[]
  model_version?: string
  feedback?: MealFeedback | null
  created_at: string
}
export type MealsPayload = {
  items: Meal[]
  total: number
  limit: number
  skip: number
}
