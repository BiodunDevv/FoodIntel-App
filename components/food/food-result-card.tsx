import { ExternalLink, Flame, Beef, Wheat, Droplets } from "lucide-react"
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
  const { calories, protein, carbs, fat } = meal.nutrition

  const confidenceColor =
    confidencePct >= 80
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-700"
      : confidencePct >= 50
        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-700"
        : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-700"

  const healthColor =
    meal.health_score >= 70
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-700"
      : meal.health_score >= 40
        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-700"
        : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-700"

  const healthBarColor =
    meal.health_score >= 70 ? "bg-emerald-500" : meal.health_score >= 40 ? "bg-amber-500" : "bg-red-500"

  const macros = [
    { label: "Cal", value: calories, unit: "kcal", icon: Flame, color: "text-orange-500 dark:text-orange-400" },
    { label: "Protein", value: protein, unit: "g", icon: Beef, color: "text-blue-500 dark:text-blue-400" },
    { label: "Carbs", value: carbs, unit: "g", icon: Wheat, color: "text-amber-500 dark:text-amber-400" },
    { label: "Fat", value: fat, unit: "g", icon: Droplets, color: "text-purple-500 dark:text-purple-400" },
  ]

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-card shadow-sm", className)}>
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        {imageSrc ? (
          <a
            href={imageSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block h-52 shrink-0 overflow-hidden sm:h-auto sm:w-56"
            title="View full image"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={meal.predicted_food}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            <div className="absolute bottom-2.5 right-2.5 flex size-7 items-center justify-center rounded-full bg-black/55 opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:opacity-100">
              <ExternalLink className="size-3.5 text-white" />
            </div>
            <div className="absolute top-2 left-2 rounded-full bg-black/55 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              {meal.serving_size_g}g
            </div>
          </a>
        ) : null}

        {/* Content */}
        <div className="flex flex-1 flex-col p-5">
          {/* Name + badges */}
          <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold capitalize leading-tight text-card-foreground">
                {meal.predicted_food}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">AI food analysis</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums", healthColor)}>
                ★ {Math.round(meal.health_score)}/100
              </span>
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums", confidenceColor)}>
                {confidencePct}% match
              </span>
            </div>
          </div>

          {/* Health score bar */}
          <div className="mb-5">
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="font-medium text-muted-foreground">Health score</span>
              <span className="font-bold text-foreground">{Math.round(meal.health_score)} / 100</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all duration-700", healthBarColor)}
                style={{ width: `${meal.health_score}%` }}
              />
            </div>
          </div>

          {/* Macro grid */}
          <div className="mt-auto grid grid-cols-4 gap-2">
            {macros.map(({ label, value, unit, icon: Icon, color }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 rounded-xl bg-muted/60 px-1.5 py-3 text-center">
                <Icon className={cn("size-4", color)} />
                <p className="text-sm font-bold leading-none text-foreground">
                  {value}<span className="text-[10px] font-normal text-muted-foreground ml-0.5">{unit}</span>
                </p>
                <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
