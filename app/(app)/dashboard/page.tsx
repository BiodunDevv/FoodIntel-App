"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ScanLine, UtensilsCrossed, Flame, Activity } from "lucide-react"
import { useAppSelector } from "@/hooks/use-app-store"
import { useTranslation } from "@/lib/i18n/use-translation"
import { getWeeklyReport } from "@/features/reports/reports.api"
import { getUserProgress } from "@/features/profile/profile.api"
import { PageHeader } from "@/components/shared/page-header"
import { StreakCard } from "@/components/gamification/streak-card"
import { LevelProgress } from "@/components/gamification/level-progress"
import { QuestCard } from "@/components/gamification/quest-card"
import { XpRing } from "@/components/gamification/xp-ring"
import { AchievementCard } from "@/components/gamification/achievement-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function formatRoundedMetric(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : "–"
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const { token, user } = useAppSelector((state) => state.auth)
  const firstName = user?.full_name?.split(" ")[0] ?? "there"

  const { data: report, isLoading } = useQuery({
    queryKey: ["weeklyReport", token],
    queryFn: () => getWeeklyReport(token!),
    enabled: !!token,
  })

  const { data: progress } = useQuery({
    queryKey: ["userProgress", token],
    queryFn: () => getUserProgress(token!),
    enabled: !!token,
  })

  const stats = [
    {
      label: t("dashboard.mealsLogged"),
      value: report?.total_meals ?? "–",
      icon: UtensilsCrossed,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: t("dashboard.avgCalories"),
      value: formatRoundedMetric(report?.average_calories_per_day),
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      label: t("dashboard.avgHealthScore"),
      value: formatRoundedMetric(report?.average_health_score),
      icon: Activity,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${t("dashboard.welcomeBack")}, ${firstName}! 👋`}
        description={t("dashboard.subtitle")}
        action={
          <Link href="/scan">
            <Button size="sm" className="gap-1.5">
              <ScanLine className="size-4" />
              {t("dashboard.quickScan")}
            </Button>
          </Link>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className={cn("flex size-9 items-center justify-center rounded-full", bg)}>
                <Icon className={cn("size-5", color)} />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{isLoading ? "–" : value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gamification row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StreakCard streak={progress?.streak_days ?? 0} />
        <div className="rounded-lg border border-border bg-card p-4 flex items-center justify-center">
          <XpRing
            xp={progress?.xp_into_level ?? 0}
            xpForNextLevel={progress?.xp_for_next_level ?? 100}
            level={progress?.level ?? 1}
          />
        </div>
        <LevelProgress
          level={progress?.level ?? 1}
          xp={progress?.xp_into_level ?? 0}
          xpForNextLevel={progress?.xp_for_next_level ?? 100}
        />
      </div>

      {/* Quests */}
      <QuestCard quests={progress?.quests ?? []} />

      <AchievementCard achievements={progress?.badges ?? []} />

      {/* Quick Scan CTA */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Ready to log a meal?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Snap a photo of your food and get instant nutritional analysis.
            </p>
          </div>
          <Link href="/scan" className="shrink-0">
            <Button className="gap-1.5 w-full sm:w-auto">
              <ScanLine className="size-4" />
              {t("scan.title")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
