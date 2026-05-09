"use client"

import { use } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  ScanLine,
  History as HistoryIcon,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Leaf,
  Zap,
} from "lucide-react"
import { getMeal } from "@/features/meals/meals.api"
import { useAppSelector } from "@/hooks/use-app-store"
import { FoodResultCard } from "@/components/food/food-result-card"
import { PredictionFeedbackCard } from "@/components/food/prediction-feedback-card"
import { LogoMark } from "@/components/logo/logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Props {
  params: Promise<{ id: string }>
}

export default function ResultPage({ params }: Props) {
  const { id } = use(params)
  const { token } = useAppSelector((state) => state.auth)

  const { data: meal, isLoading, error } = useQuery({
    queryKey: ["meal", id, token],
    queryFn: () => getMeal(id, token!),
    enabled: !!token && !!id,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <LogoMark size={48} animated className="text-primary mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    )
  }

  if (error || !meal) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-3 text-center">
          <p className="text-sm text-muted-foreground">Could not load this meal.</p>
          <Link href="/history">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="size-4" />
              Back to history
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const { nutrition } = meal
  const healthScore = Math.round(meal.health_score)
  const healthLabel =
    healthScore >= 70 ? "Good" : healthScore >= 40 ? "Fair" : "Poor"
  const healthRingColor =
    healthScore >= 70 ? "#22c55e" : healthScore >= 40 ? "#eab308" : "#ef4444"
  const healthTextColor =
    healthScore >= 70
      ? "text-emerald-500"
      : healthScore >= 40
        ? "text-yellow-500"
        : "text-red-500"

  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (healthScore / 100) * circumference

  const macros = [
    { label: "Calories", value: nutrition.calories, unit: "kcal", icon: Flame, color: "text-orange-500", bar: "bg-orange-500", max: 800 },
    { label: "Protein",  value: nutrition.protein,  unit: "g",    icon: Beef,  color: "text-blue-500",   bar: "bg-blue-500",   max: 60 },
    { label: "Carbs",    value: nutrition.carbs,    unit: "g",    icon: Wheat, color: "text-amber-500",  bar: "bg-amber-500",  max: 100 },
    { label: "Fat",      value: nutrition.fat,      unit: "g",    icon: Droplets, color: "text-purple-500", bar: "bg-purple-500", max: 50 },
  ]

  return (
    <div className="space-y-5 pb-6">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <Link href="/history">
          <Button variant="ghost" size="sm" className="-ml-2 gap-1.5">
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-bold text-foreground">Analysis Result</h1>
          <p className="text-xs text-muted-foreground">Nutritional breakdown of your meal</p>
        </div>
      </div>

      {/* Hero food card */}
      <FoodResultCard meal={meal} />

      {/* Health + Nutrition side by side */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Health Score */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">Health Score</h3>
          <div className="flex items-center gap-6">
            <div className="relative size-24 shrink-0">
              <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                <circle
                  cx="50" cy="50" r={radius}
                  fill="none" stroke="currentColor" strokeWidth="10"
                  className="text-muted"
                />
                <circle
                  cx="50" cy="50" r={radius}
                  fill="none" stroke={healthRingColor} strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{ transition: "stroke-dashoffset 0.7s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn("text-2xl font-bold", healthTextColor)}>{healthScore}</span>
                <span className="text-[10px] text-muted-foreground">/ 100</span>
              </div>
            </div>
            <div>
              <p className={cn("text-lg font-bold", healthTextColor)}>{healthLabel}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {healthScore >= 70
                  ? "Excellent nutritional profile"
                  : healthScore >= 40
                    ? "A balanced choice for most days"
                    : "Consider healthier alternatives"}
              </p>
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {Math.round(meal.confidence * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Serving</span>
                  <span className="font-semibold text-foreground tabular-nums">{meal.serving_size_g}g</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition Facts */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">Nutrition Facts</h3>
          <div className="space-y-3">
            {macros.map(({ label, value, unit, icon: Icon, color, bar, max }) => {
              const pct = Math.min(100, (value / max) * 100)
              return (
                <div key={label}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <Icon className={cn("size-3.5", color)} />
                      {label}
                    </span>
                    <span className="text-xs font-semibold tabular-nums text-foreground">
                      {value}
                      <span className="font-normal text-muted-foreground"> {unit}</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", bar)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {nutrition.fiber !== undefined && (
              <div className="flex items-center justify-between border-t border-border pt-2.5">
                <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <Leaf className="size-3.5 text-green-500" />
                  Fiber
                </span>
                <span className="text-xs font-semibold tabular-nums text-foreground">
                  {nutrition.fiber}
                  <span className="font-normal text-muted-foreground"> g</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prediction Feedback */}
      <PredictionFeedbackCard meal={meal} />

      {/* XP earned */}
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Zap className="size-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">+20 XP Earned</p>
          <p className="text-xs text-muted-foreground">Keep logging meals to level up!</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/scan" className="flex-1">
          <Button className="w-full gap-1.5 rounded-xl">
            <ScanLine className="size-4" />
            Scan another
          </Button>
        </Link>
        <Link href="/history" className="flex-1">
          <Button variant="outline" className="w-full gap-1.5 rounded-xl">
            <HistoryIcon className="size-4" />
            View history
          </Button>
        </Link>
      </div>
    </div>
  )
}
