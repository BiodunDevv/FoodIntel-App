"use client"

import { useQuery } from "@tanstack/react-query"
import { UtensilsCrossed, Flame, Activity, Star } from "lucide-react"
import { getWeeklyReport } from "@/features/reports/reports.api"
import { useAppSelector } from "@/hooks/use-app-store"
import { useTranslation } from "@/lib/i18n/use-translation"
import { CalorieTrendChart } from "@/components/reports/calorie-trend-chart"
import { MacroChart } from "@/components/reports/macro-chart"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"

export default function ReportsPage() {
  const { t } = useTranslation()
  const { token } = useAppSelector((state) => state.auth)

  const { data: report, isLoading } = useQuery({
    queryKey: ["weeklyReport", token],
    queryFn: () => getWeeklyReport(token!),
    enabled: !!token,
  })

  const topFoods = report?.most_frequent_food ? [report.most_frequent_food] : []

  const SUMMARY_STATS = [
    {
      label: t("reports.totalMeals"),
      value: report?.total_meals ?? "–",
      icon: UtensilsCrossed,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: t("reports.avgCalories"),
      value: report ? Math.round(report.average_calories_per_day) : "–",
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      label: t("reports.avgHealthScore"),
      value: report ? Math.round(report.average_health_score) : "–",
      icon: Activity,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: t("reports.topFood"),
      value: report?.most_frequent_food ?? "–",
      icon: Star,
      color: "text-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title={t("reports.title")} description={t("reports.subtitle")} />

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {SUMMARY_STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4">
            <div className={cn("mb-2 flex size-8 items-center justify-center rounded-full", bg)}>
              <Icon className={cn("size-4", color)} />
            </div>
            <p className="text-lg font-bold text-foreground">
              {isLoading ? <span className="inline-block h-5 w-12 animate-pulse rounded bg-muted" /> : value}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        </div>
      ) : report ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <CalorieTrendChart data={report.daily_calorie_trend ?? []} />
          <MacroChart data={report.macro_totals} />
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">No report data available yet. Start tracking meals to see insights.</p>
        </div>
      )}

      {/* Top foods */}
      {report && topFoods.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-card-foreground">Top Foods This Week</h3>
          <div className="flex flex-wrap gap-2">
            {topFoods.map((food, i) => (
              <span
                key={i}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium capitalize text-primary"
              >
                {food}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
