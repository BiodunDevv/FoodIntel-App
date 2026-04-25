"use client"

import { use } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, ScanLine, History as HistoryIcon, Star } from "lucide-react"
import { getMeal } from "@/features/meals/meals.api"
import { useAppSelector } from "@/hooks/use-app-store"
import { useTranslation } from "@/lib/i18n/use-translation"
import { FoodResultCard } from "@/components/food/food-result-card"
import { HealthScoreCard } from "@/components/food/health-score-card"
import { NutritionCard } from "@/components/food/nutrition-card"
import { PredictionFeedbackCard } from "@/components/food/prediction-feedback-card"
import { RecommendationCard } from "@/components/food/recommendation-card"
import { LogoMark } from "@/components/logo/logo"
import { Button } from "@/components/ui/button"

interface Props {
  params: Promise<{ id: string }>
}

export default function ResultPage({ params }: Props) {
  const { id } = use(params)
  const { t } = useTranslation()
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
          <p className="mt-4 text-sm text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  if (error || !meal) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{t("common.error")}</p>
          <Link href="/history">
            <Button variant="outline" size="sm" className="mt-4 gap-1.5">
              <ArrowLeft className="size-4" />
              {t("result.viewHistory")}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <Link href="/history">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="size-4" />
            {t("common.back")}
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-bold text-foreground">{t("result.title")}</h1>
          <p className="text-xs text-muted-foreground">{t("result.subtitle")}</p>
        </div>
      </div>

      {/* Hero food card */}
      <FoodResultCard meal={meal} />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: t("result.calories"), value: `${meal.nutrition.calories} kcal` },
          { label: t("result.protein"), value: `${meal.nutrition.protein}g` },
          { label: t("result.carbs"), value: `${meal.nutrition.carbs}g` },
          { label: t("result.fat"), value: `${meal.nutrition.fat}g` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="text-base font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Health + Nutrition */}
      <div className="grid gap-4 lg:grid-cols-2">
        <HealthScoreCard score={meal.health_score} />
        <NutritionCard nutrition={meal.nutrition} />
      </div>

      {/* Recommendations */}
      {meal.recommendations?.length > 0 && (
        <RecommendationCard recommendations={meal.recommendations} />
      )}

      <PredictionFeedbackCard meal={meal} />

      {/* XP earned card */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
            <Star className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">+20 XP {t("result.xpEarned")}</p>
            <p className="text-xs text-muted-foreground">Keep logging meals to level up!</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/scan" className="flex-1">
          <Button className="w-full gap-1.5">
            <ScanLine className="size-4" />
            {t("result.scanAnother")}
          </Button>
        </Link>
        <Link href="/history" className="flex-1">
          <Button variant="outline" className="w-full gap-1.5">
            <HistoryIcon className="size-4" />
            {t("result.viewHistory")}
          </Button>
        </Link>
      </div>
    </div>
  )
}
