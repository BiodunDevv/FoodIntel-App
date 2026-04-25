import { cn } from "@/lib/utils"
import type { Meal } from "@/features/meals/meals.types"
import { resolveMealImageUrl } from "@/lib/images"

interface FoodResultCardProps {
  meal: Meal
  className?: string
}

export function FoodResultCard({ meal, className }: FoodResultCardProps) {
  const confidencePct = Math.round(meal.confidence * 100)
  const imageSrc = resolveMealImageUrl(meal.image_url)

  const confidenceColor =
    confidencePct >= 80
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : confidencePct >= 50
        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"

  const healthColor =
    meal.health_score >= 70
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : meal.health_score >= 40
        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"

  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-card", className)}>
      <div className="flex flex-col sm:flex-row">
        {imageSrc && (
          <div className="relative h-48 sm:h-auto sm:w-48 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={meal.predicted_food}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="flex flex-col justify-between p-4 flex-1">
          <div>
            <div className="mb-2 flex items-start justify-between gap-2">
              <h2 className="text-lg font-bold capitalize text-card-foreground">{meal.predicted_food}</h2>
              <div className="flex flex-wrap justify-end gap-2">
                <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold", healthColor)}>
                  Health {Math.round(meal.health_score)}
                </span>
                <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold", confidenceColor)}>
                  {confidencePct}% confidence
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-muted p-2.5 text-center">
              <p className="text-lg font-bold text-foreground">{meal.nutrition.calories}</p>
              <p className="text-xs text-muted-foreground">kcal</p>
            </div>
            <div className="rounded-md bg-muted p-2.5 text-center">
              <p className="text-lg font-bold text-foreground">{meal.serving_size_g}g</p>
              <p className="text-xs text-muted-foreground">serving</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
