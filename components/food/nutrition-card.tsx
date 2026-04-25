import { cn } from "@/lib/utils"
import type { Nutrition } from "@/features/meals/meals.types"

interface NutritionCardProps {
  nutrition: Nutrition
  className?: string
}

const MACROS = [
  { key: "calories" as const, label: "Calories", unit: "kcal", max: 800, color: "bg-primary" },
  { key: "protein" as const, label: "Protein", unit: "g", max: 60, color: "bg-blue-500" },
  { key: "carbs" as const, label: "Carbs", unit: "g", max: 100, color: "bg-yellow-500" },
  { key: "fat" as const, label: "Fat", unit: "g", max: 50, color: "bg-orange-500" },
]

export function NutritionCard({ nutrition, className }: NutritionCardProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <h3 className="mb-4 text-sm font-semibold text-card-foreground">Nutrition Facts</h3>
      <div className="space-y-3">
        {MACROS.map(({ key, label, unit, max, color }) => {
          const value = nutrition[key] ?? 0
          const pct = Math.min(100, (value / max) * 100)
          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">{label}</span>
                <span className="text-xs font-semibold text-foreground">
                  {value}
                  <span className="font-normal text-muted-foreground"> {unit}</span>
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", color)}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
        {nutrition.fiber !== undefined && (
          <div className="border-t border-border pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">Fiber</span>
              <span className="text-xs font-semibold text-foreground">
                {nutrition.fiber}<span className="font-normal text-muted-foreground"> g</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
