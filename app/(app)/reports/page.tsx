"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
  Flame,
  Activity,
  Star,
  TrendingUp,
  Lightbulb,
} from "lucide-react"
import { format, startOfMonth, endOfMonth, getDaysInMonth, getDay } from "date-fns"
import { useRouter } from "next/navigation"
import { getMonthlyReport } from "@/features/reports/reports.api"
import { useAppSelector } from "@/hooks/use-app-store"
import { useTranslation } from "@/lib/i18n/use-translation"
import { CalorieTrendChart } from "@/components/reports/calorie-trend-chart"
import { MacroChart } from "@/components/reports/macro-chart"
import { cn } from "@/lib/utils"

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtDate(d: Date) {
  return format(d, "yyyy-MM-dd")
}

// ─── calendar ────────────────────────────────────────────────────────────────

function MonthCalendar({
  data,
  month,
  onDayClick,
  t,
}: {
  data: { date: string; calories: number; meals: number }[]
  month: Date
  onDayClick: (dateStr: string) => void
  t: (k: string) => string
}) {
  const byDate = useMemo(() => {
    const m: Record<string, { calories: number; meals: number }> = {}
    data.forEach((d) => (m[d.date] = d))
    return m
  }, [data])

  const daysInMonth = getDaysInMonth(month)
  const firstDow = getDay(startOfMonth(month))
  const maxCal = useMemo(() => Math.max(...data.map((d) => d.calories), 1), [data])
  const todayStr = fmtDate(new Date())

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
          <TrendingUp className="size-4 text-primary" />
          {t("reports.dailyActivity")}
        </h3>
        <p className="text-[11px] text-muted-foreground">{t("reports.clickDay")}</p>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {DAYS.map((d) => (
          <div key={d} className="pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {d}
          </div>
        ))}

        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />

          const dateStr = `${format(month, "yyyy-MM")}-${String(day).padStart(2, "0")}`
          const entry = byDate[dateStr]
          const cal = entry?.calories ?? 0
          const meals = entry?.meals ?? 0
          const intensity = cal > 0 ? Math.max(0.12, cal / maxCal) : 0
          const isT = dateStr === todayStr
          const hasMeals = meals > 0

          return (
            <div key={dateStr} className="group relative flex flex-col items-center">
              <button
                onClick={() => hasMeals && onDayClick(dateStr)}
                disabled={!hasMeals}
                className={cn(
                  "flex size-8 items-center justify-center rounded-md text-[11px] font-medium transition-all",
                  hasMeals
                    ? "cursor-pointer hover:ring-2 hover:ring-primary/60 hover:ring-offset-1 hover:ring-offset-card"
                    : "cursor-default",
                  isT && !hasMeals && "ring-1 ring-primary/40",
                  !hasMeals && "text-muted-foreground/50",
                )}
                style={
                  cal > 0
                    ? {
                        backgroundColor: `oklch(0.505 0.213 27.518 / ${intensity})`,
                        color: intensity > 0.55 ? "white" : "var(--color-foreground)",
                      }
                    : undefined
                }
                aria-label={hasMeals ? `View meals for ${dateStr}` : undefined}
              >
                {day}
              </button>

              {hasMeals && (
                <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1.5 text-[10px] text-popover-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  <p className="font-semibold">{Math.round(cal)} kcal</p>
                  <p className="text-muted-foreground">{meals} meal{meals !== 1 ? "s" : ""} · {t("reports.clickToView")}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* legend */}
      <div className="mt-4 flex items-center justify-end gap-2">
        <span className="text-[10px] text-muted-foreground">{t("reports.less")}</span>
        {[0.08, 0.25, 0.5, 0.75, 1].map((op) => (
          <div key={op} className="size-3 rounded-sm" style={{ backgroundColor: `oklch(0.505 0.213 27.518 / ${op})` }} />
        ))}
        <span className="text-[10px] text-muted-foreground">{t("reports.more")}</span>
      </div>
    </div>
  )
}

// ─── stat card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, bg, loading }: {
  label: string; value: string | number; icon: React.ElementType; color: string; bg: string; loading: boolean
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className={cn("mb-3 flex size-9 items-center justify-center rounded-full", bg)}>
        <Icon className={cn("size-4", color)} />
      </div>
      <p className="text-xl font-bold text-foreground">
        {loading ? <span className="inline-block h-6 w-14 animate-pulse rounded-md bg-muted" /> : value}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { token } = useAppSelector((state) => state.auth)
  const { t } = useTranslation()
  const router = useRouter()

  const now = new Date()
  const [viewMonth, setViewMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1))

  const isCurrentMonth =
    viewMonth.getFullYear() === now.getFullYear() && viewMonth.getMonth() === now.getMonth()

  const startDate = fmtDate(startOfMonth(viewMonth))
  const endDate = fmtDate(isCurrentMonth ? now : endOfMonth(viewMonth))

  const { data: report, isLoading } = useQuery({
    queryKey: ["monthlyReport", token, startDate, endDate],
    queryFn: () => getMonthlyReport(token!, startDate, endDate),
    enabled: !!token,
  })

  function prevMonth() {
    setViewMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }

  function nextMonth() {
    if (!isCurrentMonth) {
      setViewMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
    }
  }

  const macroRows = report
    ? [
        { label: "Protein", value: report.macro_totals.protein, color: "bg-blue-500", textColor: "text-blue-600 dark:text-blue-400" },
        { label: "Carbs", value: report.macro_totals.carbs, color: "bg-yellow-500", textColor: "text-yellow-600 dark:text-yellow-400" },
        { label: "Fat", value: report.macro_totals.fat, color: "bg-orange-500", textColor: "text-orange-600 dark:text-orange-400" },
        { label: "Fiber", value: report.macro_totals.fiber, color: "bg-green-500", textColor: "text-green-600 dark:text-green-400" },
      ]
    : []
  const macroBase = report
    ? report.macro_totals.protein + report.macro_totals.carbs + report.macro_totals.fat || 1
    : 1

  return (
    <div className="space-y-6">

      {/* month navigator */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t("reports.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {format(viewMonth, "MMMM yyyy")}
            {isCurrentMonth && (
              <span className="ml-2 rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
                {t("reports.currentMonth")}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="flex size-8 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-muted"
            aria-label={t("reports.prevMonth")}
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => setViewMonth(new Date(now.getFullYear(), now.getMonth(), 1))}
            disabled={isCurrentMonth}
            className={cn(
              "rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors",
              isCurrentMonth ? "cursor-default text-muted-foreground/50" : "text-foreground hover:bg-muted",
            )}
          >
            {t("reports.today")}
          </button>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className={cn(
              "flex size-8 items-center justify-center rounded-md border border-border bg-card transition-colors",
              isCurrentMonth ? "cursor-default text-muted-foreground/30" : "text-foreground hover:bg-muted",
            )}
            aria-label={t("reports.nextMonth")}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* date range pill */}
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5">
        <div className="size-2 rounded-full bg-primary" />
        <p className="text-sm text-foreground">
          <span className="font-semibold">{format(new Date(startDate + "T00:00:00"), "MMM d")}</span>
          <span className="mx-2 text-muted-foreground">→</span>
          <span className="font-semibold">{format(new Date(endDate + "T00:00:00"), "MMM d, yyyy")}</span>
        </p>
        {!isLoading && report && (
          <span className="ml-auto text-xs text-muted-foreground">
            {report.total_meals} meal{report.total_meals !== 1 ? "s" : ""} logged
          </span>
        )}
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t("reports.mealsLogged")} value={report?.total_meals ?? "–"} icon={UtensilsCrossed} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" loading={isLoading} />
        <StatCard label={t("reports.avgCalDay")} value={report ? `${Math.round(report.average_calories_per_day)} kcal` : "–"} icon={Flame} color="text-orange-500" bg="bg-orange-50 dark:bg-orange-900/20" loading={isLoading} />
        <StatCard label={t("reports.avgHealthScore")} value={report ? Math.round(report.average_health_score) : "–"} icon={Activity} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" loading={isLoading} />
        <StatCard label={t("reports.topFood")} value={report?.most_frequent_food ?? "–"} icon={Star} color="text-yellow-500" bg="bg-yellow-50 dark:bg-yellow-900/20" loading={isLoading} />
      </div>

      {/* calendar */}
      {isLoading ? (
        <div className="h-52 animate-pulse rounded-xl bg-muted" />
      ) : report ? (
        <MonthCalendar
          data={report.daily_calorie_trend}
          month={viewMonth}
          onDayClick={(dateStr) => router.push(`/reports/${dateStr}`)}
          t={t}
        />
      ) : null}

      {/* charts */}
      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        </div>
      ) : report && report.total_meals > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <CalorieTrendChart data={report.daily_calorie_trend} />
          <MacroChart data={report.macro_totals} />
        </div>
      ) : !isLoading ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <UtensilsCrossed className="mx-auto mb-3 size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">{t("reports.noMealsMonth")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("reports.noMealsMonthDesc")}</p>
        </div>
      ) : null}

      {/* macro breakdown */}
      {!isLoading && report && report.total_meals > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">{t("reports.macroBreakdown")}</h3>
          <div className="space-y-3">
            {macroRows.map(({ label, value, color, textColor }) => {
              const pct = macroBase > 0 ? Math.round((value / macroBase) * 100) : 0
              return (
                <div key={label}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">{label}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs font-semibold", textColor)}>{Math.round(value)}g</span>
                      <span className="w-7 text-right text-[10px] text-muted-foreground">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
            {[
              { label: "Fiber", value: report.macro_totals.fiber, unit: "g" },
              { label: "Sugar", value: report.macro_totals.sugar, unit: "g" },
              { label: "Sodium", value: report.macro_totals.sodium, unit: "mg" },
            ].map(({ label, value, unit }) => (
              <div key={label} className="rounded-lg bg-muted/60 p-2.5 text-center">
                <p className="text-sm font-bold text-foreground">{Math.round(value)}{unit}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* insights */}
      {!isLoading && report && report.recommendations?.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-card-foreground">
            <Lightbulb className="size-4 text-yellow-500" />
            {t("reports.insights")}
          </h3>
          <ul className="space-y-2">
            {report.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
