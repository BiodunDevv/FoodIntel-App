import { apiClient } from "@/lib/api/client"

export type WeeklyReport = {
  start_date: string
  end_date: string
  total_meals: number
  total_calories: number
  average_calories_per_day: number
  average_health_score: number
  most_frequent_food: string | null
  daily_calorie_trend: { date: string; calories: number; meals: number }[]
  macro_totals: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    sugar: number
    sodium: number
  }
  recommendations: string[]
}

export function getMonthlyReport(
  token: string,
  startDate: string,
  endDate: string,
): Promise<WeeklyReport> {
  return apiClient.get<WeeklyReport>(
    `/reports/weekly?start_date=${startDate}&end_date=${endDate}`,
    { token },
  )
}

// kept for backwards compat
export function getWeeklyReport(token: string): Promise<WeeklyReport> {
  return apiClient.get<WeeklyReport>("/reports/weekly", { token })
}
