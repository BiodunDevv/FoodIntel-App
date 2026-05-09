"use client"

import { use, useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  ArrowLeft,
  Calendar,
  Eye,
  Flame,
  Trash2,
  UtensilsCrossed,
  TrendingUp,
} from "lucide-react"
import { format, parseISO, isToday, isYesterday, isValid } from "date-fns"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getMeals, deleteMeal } from "@/features/meals/meals.api"
import type { Meal } from "@/features/meals/meals.types"
import { useAppSelector } from "@/hooks/use-app-store"
import { useTranslation } from "@/lib/i18n/use-translation"
import { resolveMealImageUrl } from "@/lib/images"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ─── helpers ────────────────────────────────────────────────────────────────

function dateLabel(iso: string, t: (k: string) => string) {
  const d = parseISO(iso + "T00:00:00")
  if (isToday(d)) return t("common.today")
  if (isYesterday(d)) return t("common.yesterday")
  return format(d, "EEEE, MMMM d")
}

function healthBadge(score: number) {
  return score >= 70
    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    : score >= 40
      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
}

function confBadge(pct: number) {
  return pct >= 80
    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    : pct >= 50
      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
}

// ─── meal card ───────────────────────────────────────────────────────────────

function MealCard({
  meal,
  index,
  onDelete,
  isDeleting,
  t,
}: {
  meal: Meal
  index: number
  onDelete: (id: string) => void
  isDeleting: boolean
  t: (k: string) => string
}) {
  const imageSrc = resolveMealImageUrl(meal.image_url)
  const confPct = Math.round(meal.confidence * 100)

  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex">
        {/* image */}
        <div className="relative w-24 shrink-0 sm:w-32">
          {imageSrc ? (
            <a
              href={imageSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="group block h-full min-h-[96px]"
              title={t("reportDay.viewFullImage")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt={meal.predicted_food}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/25">
                <svg className="size-5 text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
          ) : (
            <div className="flex h-full min-h-[96px] items-center justify-center bg-muted">
              <UtensilsCrossed className="size-6 text-muted-foreground/40" />
            </div>
          )}
        </div>

        {/* content */}
        <div className="flex min-w-0 flex-1 flex-col justify-between p-3.5">
          <div>
            <div className="flex items-start justify-between gap-2">
              <Link href={`/result/${meal.id}`} className="min-w-0 hover:underline underline-offset-2">
                <h3 className="truncate text-sm font-bold capitalize text-foreground">{meal.predicted_food}</h3>
              </Link>
              <span className="shrink-0 text-xs text-muted-foreground">
                {format(parseISO(meal.created_at), "h:mm a")}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", healthBadge(meal.health_score))}>
                Health {Math.round(meal.health_score)}
              </span>
              <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", confBadge(confPct))}>
                {confPct}% {t("result.confidence")}
              </span>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Flame className="size-3 text-orange-400" />
                {meal.nutrition.calories} kcal
              </span>
              <span>{meal.nutrition.protein}g {t("result.protein")}</span>
              <span>{meal.serving_size_g}g {t("result.serving")}</span>
            </div>
            <div className="flex shrink-0 items-center gap-1 pl-2">
              <Link href={`/result/${meal.id}`}>
                <button
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title={t("reportDay.viewResult")}
                >
                  <Eye className="size-3.5" />
                </button>
              </Link>
              <button
                onClick={() => onDelete(meal.id)}
                disabled={isDeleting}
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-50 hover:text-destructive dark:hover:bg-red-900/20"
                title={t("common.delete")}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>

          {meal.feedback && (
            <p className="mt-1 text-[10px] text-muted-foreground">
              {meal.feedback.is_correct
                ? "✓ Prediction confirmed"
                : `→ Corrected to ${meal.feedback.corrected_food}`}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ date: string }>
}

export default function ReportDatePage({ params }: Props) {
  const { date } = use(params)
  const router = useRouter()
  const { token } = useAppSelector((state) => state.auth)
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const isValidDate = isValid(parseISO(date + "T00:00:00")) && /^\d{4}-\d{2}-\d{2}$/.test(date)

  // fetch only meals for this specific date via backend filter
  const { data: mealsData, isLoading } = useQuery({
    queryKey: ["mealsForDate", token, date],
    queryFn: () => getMeals(token!, { date }),
    enabled: !!token && isValidDate,
    staleTime: 30_000,
  })

  const { mutate: doDelete, isPending: isDeleting, variables: deletingId } = useMutation({
    mutationFn: (id: string) => deleteMeal(id, token!),
    onSuccess: () => {
      toast.success(t("history.delete") + " ✓")
      queryClient.invalidateQueries({ queryKey: ["mealsForDate", token, date] })
      queryClient.invalidateQueries({ queryKey: ["monthlyReport"] })
      queryClient.invalidateQueries({ queryKey: ["meals"] })
      setConfirmDeleteId(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const meals: Meal[] = useMemo(
    () => mealsData?.items ?? [],
    [mealsData],
  )

  const totalCal = Math.round(meals.reduce((s, m) => s + m.nutrition.calories, 0))
  const totalProtein = Math.round(meals.reduce((s, m) => s + m.nutrition.protein, 0))
  const totalCarbs = Math.round(meals.reduce((s, m) => s + m.nutrition.carbs, 0))
  const totalFat = Math.round(meals.reduce((s, m) => s + m.nutrition.fat, 0))
  const totalFiber = Math.round(meals.reduce((s, m) => s + (m.nutrition.fiber ?? 0), 0))
  const avgHealth = meals.length
    ? Math.round(meals.reduce((s, m) => s + m.health_score, 0) / meals.length)
    : 0
  const macroTotal = totalProtein + totalCarbs + totalFat || 1
  const hColor =
    avgHealth >= 70
      ? "text-green-600 dark:text-green-400"
      : avgHealth >= 40
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-red-600 dark:text-red-400"

  if (!isValidDate) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{t("reportDay.invalidDate")}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => router.back()}>
            {t("reportDay.goBack")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* back + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
          {t("reportDay.backToReport")}
        </button>
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-primary" />
            <h1 className="text-lg font-bold text-foreground">{dateLabel(date, t)}</h1>
          </div>
          <p className="ml-6 text-xs text-muted-foreground">
            {format(parseISO(date + "T00:00:00"), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
      </div>

      {/* loading skeleton */}
      {isLoading && (
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 h-3 w-24 animate-pulse rounded-md bg-muted" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-lg bg-muted/60 p-3">
                  <div className="mx-auto mb-1.5 h-6 w-12 animate-pulse rounded-md bg-muted" />
                  <div className="mx-auto h-2.5 w-10 animate-pulse rounded-md bg-muted" />
                </div>
              ))}
            </div>
            <div className="mt-4 h-2.5 w-full animate-pulse rounded-full bg-muted" />
          </div>
          <div className="h-32 animate-pulse rounded-xl bg-muted" />
          <div className="space-y-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex overflow-hidden rounded-xl border border-border bg-card">
                <div className="w-24 animate-pulse bg-muted sm:w-32" style={{ minHeight: 96 }} />
                <div className="flex-1 space-y-2.5 p-3.5">
                  <div className="h-4 w-40 animate-pulse rounded-md bg-muted" />
                  <div className="h-3 w-24 animate-pulse rounded-md bg-muted" />
                  <div className="h-3 w-56 animate-pulse rounded-md bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* no meals */}
      {!isLoading && meals.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <UtensilsCrossed className="mx-auto mb-3 size-9 text-muted-foreground/30" />
          <p className="text-sm font-medium text-foreground">{t("reportDay.noMeals")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("reportDay.noMealsDesc")}</p>
          <Link href="/scan" className="mt-4 inline-block">
            <Button size="sm">{t("reportDay.scanMeal")}</Button>
          </Link>
        </div>
      )}

      {/* day content */}
      {!isLoading && meals.length > 0 && (
        <>
          {/* summary card */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("reportDay.daySummary")}
            </p>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {[
                { label: t("reportDay.meals"), value: String(meals.length) },
                { label: t("reportDay.kcal"), value: String(totalCal) },
                { label: t("reportDay.protein"), value: `${totalProtein}g` },
                { label: t("reportDay.carbs"), value: `${totalCarbs}g` },
                { label: t("reportDay.avgScore"), value: String(avgHealth), cls: hColor },
              ].map(({ label, value, cls }) => (
                <div key={label} className="rounded-lg bg-muted/60 p-3 text-center">
                  <p className={cn("text-xl font-bold text-foreground", cls)}>{value}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            {/* macro bar */}
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{t("reportDay.macroSplit")}</span>
                <div className="flex gap-3">
                  {[
                    { label: "P", value: totalProtein, dot: "bg-blue-500" },
                    { label: "C", value: totalCarbs, dot: "bg-yellow-500" },
                    { label: "F", value: totalFat, dot: "bg-orange-500" },
                    { label: "Fi", value: totalFiber, dot: "bg-green-500" },
                  ].map((b) => (
                    <span key={b.label} className="flex items-center gap-1">
                      <span className={cn("inline-block size-1.5 rounded-full", b.dot)} />
                      {b.label} {b.value}g
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
                {[
                  { value: totalProtein, color: "bg-blue-500" },
                  { value: totalCarbs, color: "bg-yellow-500" },
                  { value: totalFat, color: "bg-orange-500" },
                  { value: totalFiber, color: "bg-green-500" },
                ].map((b, i) => (
                  <div
                    key={i}
                    className={cn("h-full transition-all duration-700", b.color)}
                    style={{ width: `${Math.round((b.value / macroTotal) * 100)}%` }}
                  />
                ))}
              </div>
            </div>

            {/* micro stats */}
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
              {[
                { label: t("reportDay.fat"), value: totalFat, unit: "g", color: "text-orange-500" },
                { label: t("reportDay.fiber"), value: totalFiber, unit: "g", color: "text-green-500" },
                { label: t("reportDay.meals"), value: meals.length, unit: "", color: "text-primary" },
              ].map(({ label, value, unit, color }) => (
                <div key={label} className="rounded-lg bg-muted/40 p-2.5 text-center">
                  <p className={cn("text-sm font-bold", color)}>{value}{unit}</p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* meal timeline bar chart */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-card-foreground">
              <TrendingUp className="size-4 text-primary" />
              {t("reportDay.mealTimeline")}
            </h3>
            <div className="relative pb-4">
              <div className="absolute left-0 top-0 flex h-full flex-col justify-between pb-4 pr-2 text-[9px] text-muted-foreground">
                <span>{t("reportDay.high")}</span>
                <span>{t("reportDay.low")}</span>
              </div>
              <div className="ml-7 flex items-end gap-2">
                {meals.map((m) => {
                  const barH = Math.max(12, Math.round((m.nutrition.calories / (totalCal || 1)) * 100))
                  const barColor =
                    m.health_score >= 70
                      ? "bg-green-400 dark:bg-green-500"
                      : m.health_score >= 40
                        ? "bg-yellow-400 dark:bg-yellow-500"
                        : "bg-red-400 dark:bg-red-500"
                  return (
                    <Link
                      key={m.id}
                      href={`/result/${m.id}`}
                      className="group relative flex flex-1 flex-col items-center gap-1"
                      title={`${m.predicted_food} — ${m.nutrition.calories} kcal`}
                    >
                      <div
                        className={cn("w-full min-w-[20px] rounded-t-md transition-all duration-500 group-hover:opacity-75", barColor)}
                        style={{ height: `${barH}px` }}
                      />
                      <p className="truncate text-center text-[9px] text-muted-foreground" style={{ maxWidth: 52 }}>
                        {format(parseISO(m.created_at), "h:mma")}
                      </p>
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1.5 text-[10px] text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                        <p className="font-semibold capitalize">{m.predicted_food}</p>
                        <p className="text-muted-foreground">{m.nutrition.calories} kcal · {t("result.healthScore")} {Math.round(m.health_score)}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* meals list */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {meals.length} {t("reportDay.mealsLogged")}
              </p>
              <p className="text-[10px] text-muted-foreground">{t("reportDay.tapForDetails")}</p>
            </div>
            {meals.map((m, i) => (
              <MealCard
                key={m.id}
                meal={m}
                index={i}
                onDelete={setConfirmDeleteId}
                isDeleting={isDeleting && deletingId === m.id}
                t={t}
              />
            ))}
          </div>
        </>
      )}

      {/* delete confirm */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
            <h2 className="mb-2 text-base font-semibold text-foreground">{t("reportDay.deleteMeal")}</h2>
            <p className="mb-6 text-sm text-muted-foreground">{t("reportDay.deleteDesc")}</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(null)}>
                {t("common.cancel")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                onClick={() => confirmDeleteId && doDelete(confirmDeleteId)}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {isDeleting ? t("reportDay.deleting") : t("reportDay.deleteMealBtn")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
