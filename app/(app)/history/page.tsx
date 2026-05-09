"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Eye,
  Search,
  Trash2,
  UtensilsCrossed,
  ChevronDown,
  ArrowLeft,
  Calendar,
  Flame,
  Activity,
} from "lucide-react"
import { format, isToday, isYesterday, parseISO } from "date-fns"
import { getMeals, deleteMeal } from "@/features/meals/meals.api"
import type { Meal } from "@/features/meals/meals.types"
import { useAppSelector } from "@/hooks/use-app-store"
import { useTranslation } from "@/lib/i18n/use-translation"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { resolveMealImageUrl } from "@/lib/images"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"

// ─── helpers ────────────────────────────────────────────────────────────────

function dateLabel(iso: string, t: (k: string) => string): string {
  const d = parseISO(iso)
  if (isToday(d)) return t("common.today")
  if (isYesterday(d)) return t("common.yesterday")
  return format(d, "EEEE, MMMM d")
}

function healthColor(score: number) {
  return score >= 70
    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    : score >= 40
      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
}

function confidenceColor(pct: number) {
  return pct >= 80
    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    : pct >= 50
      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
}

// ─── single meal row ─────────────────────────────────────────────────────────

function MealRow({
  meal,
  onDelete,
  isDeleting,
}: {
  meal: Meal
  onDelete: (id: string) => void
  isDeleting: boolean
}) {
  const imageSrc = resolveMealImageUrl(meal.image_url)
  const confPct = Math.round(meal.confidence * 100)

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-3 transition-colors hover:bg-muted/40">
      {/* thumbnail */}
      <div className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
        {imageSrc ? (
          <a
            href={imageSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block size-full"
            title="View full image"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageSrc} alt={meal.predicted_food} className="size-full object-cover transition-transform duration-200 group-hover:scale-110" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
              <svg className="size-3.5 text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </a>
        ) : (
          <div className="flex size-full items-center justify-center">
            <UtensilsCrossed className="size-4 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Link href={`/result/${meal.id}`} className="min-w-0 hover:underline underline-offset-2">
            <span className="text-sm font-semibold capitalize text-foreground">{meal.predicted_food}</span>
          </Link>
          <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", healthColor(meal.health_score))}>
            {Math.round(meal.health_score)}
          </span>
          <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", confidenceColor(confPct))}>
            {confPct}%
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-2.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Flame className="size-3 text-orange-400" />
            {meal.nutrition.calories} kcal
          </span>
          <span>{meal.serving_size_g}g serving</span>
          <span className="text-muted-foreground/60">{format(parseISO(meal.created_at), "h:mm a")}</span>
        </div>
        {meal.feedback && (
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {meal.feedback.is_correct ? "✓ Confirmed" : `→ ${meal.feedback.corrected_food}`}
          </p>
        )}
      </div>

      {/* actions */}
      <div className="flex shrink-0 items-center gap-1">
        <Link href={`/result/${meal.id}`}>
          <button className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title="View result">
            <Eye className="size-3.5" />
          </button>
        </Link>
        <button
          onClick={() => onDelete(meal.id)}
          disabled={isDeleting}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-50 hover:text-destructive dark:hover:bg-red-900/20"
          title="Delete meal"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── date group ───────────────────────────────────────────────────────────────

function DateGroup({
  dateKey,
  meals,
  onDeleteMeal,
  deletingId,
  defaultOpen,
  onDateClick,
  t,
}: {
  dateKey: string
  meals: Meal[]
  onDeleteMeal: (id: string) => void
  deletingId: string | null
  defaultOpen: boolean
  onDateClick: (dateKey: string) => void
  t: (k: string) => string
}) {
  const [open, setOpen] = useState(defaultOpen)
  const totalCal = Math.round(meals.reduce((s, m) => s + m.nutrition.calories, 0))
  const avgHealth = Math.round(meals.reduce((s, m) => s + m.health_score, 0) / meals.length)

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {/* header row — div not button so we can nest the "View day" button inside */}
      <div
        role="button"
        tabIndex={0}
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((v) => !v) } }}
      >
        <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-md transition-transform", open ? "rotate-0" : "-rotate-90")}>
          <ChevronDown className="size-4 text-muted-foreground" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{dateLabel(dateKey, t)}</span>
            <span className="text-xs text-muted-foreground">{format(parseISO(dateKey), "MMM d, yyyy")}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{meals.length} {t("history.meals")}</span>
            <span className="flex items-center gap-1">
              <Flame className="size-3 text-orange-400" />
              {totalCal} kcal
            </span>
            <span className="flex items-center gap-1">
              <Activity className="size-3 text-green-400" />
              {avgHealth} {t("history.avgScore")}
            </span>
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onDateClick(dateKey) }}
          className="shrink-0 rounded-md border border-border/60 bg-background/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          title={`${t("history.viewDay")} — ${dateLabel(dateKey, t)}`}
        >
          {t("history.viewDay")}
        </button>
      </div>

      {/* meals list */}
      {open && (
        <div className="space-y-1.5 border-t border-border/60 p-3">
          {meals.map((meal) => (
            <MealRow
              key={meal.id}
              meal={meal}
              onDelete={onDeleteMeal}
              isDeleting={deletingId === meal.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── day detail panel ────────────────────────────────────────────────────────

function DayDetailPanel({
  dateKey,
  meals,
  onClose,
  onDeleteMeal,
  deletingId,
  t,
}: {
  dateKey: string
  meals: Meal[]
  onClose: () => void
  onDeleteMeal: (id: string) => void
  deletingId: string | null
  t: (k: string) => string
}) {
  const totalCal = Math.round(meals.reduce((s, m) => s + m.nutrition.calories, 0))
  const totalProtein = Math.round(meals.reduce((s, m) => s + m.nutrition.protein, 0))
  const totalCarbs = Math.round(meals.reduce((s, m) => s + m.nutrition.carbs, 0))
  const totalFat = Math.round(meals.reduce((s, m) => s + m.nutrition.fat, 0))
  const avgHealth = Math.round(meals.reduce((s, m) => s + m.health_score, 0) / meals.length)

  const hColor = avgHealth >= 70 ? "text-green-600 dark:text-green-400" : avgHealth >= 40 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"

  return (
    <div className="space-y-4">
      {/* back button + date title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
          {t("common.back")}
        </button>
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">{dateLabel(dateKey, t)}</h2>
          </div>
          <p className="ml-6 text-xs text-muted-foreground">{format(parseISO(dateKey), "EEEE, MMMM d, yyyy")}</p>
        </div>
      </div>

      {/* day summary card */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("history.daySummary")}</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-md bg-muted/60 p-2.5 text-center sm:col-span-1">
            <p className="text-lg font-bold text-foreground">{meals.length}</p>
            <p className="text-[10px] text-muted-foreground">{t("history.meals")}</p>
          </div>
          <div className="rounded-md bg-muted/60 p-2.5 text-center">
            <p className="text-lg font-bold text-foreground">{totalCal}</p>
            <p className="text-[10px] text-muted-foreground">{t("history.kcal")}</p>
          </div>
          <div className="rounded-md bg-muted/60 p-2.5 text-center">
            <p className="text-lg font-bold text-foreground">{totalProtein}g</p>
            <p className="text-[10px] text-muted-foreground">{t("history.protein")}</p>
          </div>
          <div className="rounded-md bg-muted/60 p-2.5 text-center">
            <p className="text-lg font-bold text-foreground">{totalCarbs}g</p>
            <p className="text-[10px] text-muted-foreground">{t("history.carbs")}</p>
          </div>
          <div className="rounded-md bg-muted/60 p-2.5 text-center">
            <p className={cn("text-lg font-bold", hColor)}>{avgHealth}</p>
            <p className="text-[10px] text-muted-foreground">{t("history.avgScore")}</p>
          </div>
        </div>

        {/* macro bar */}
        <div className="mt-3">
          {(() => {
            const macroTotal = totalProtein + totalCarbs + totalFat || 1
            const bars = [
              { label: "P", value: totalProtein, color: "bg-blue-500", pct: Math.round((totalProtein / macroTotal) * 100) },
              { label: "C", value: totalCarbs, color: "bg-yellow-500", pct: Math.round((totalCarbs / macroTotal) * 100) },
              { label: "F", value: totalFat, color: "bg-orange-500", pct: Math.round((totalFat / macroTotal) * 100) },
            ]
            return (
              <div>
                <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{t("history.macroSplit")}</span>
                  <div className="flex gap-3">
                    {bars.map((b) => (
                      <span key={b.label} className="flex items-center gap-1">
                        <span className={cn("inline-block size-1.5 rounded-full", b.color)} />
                        {b.label} {b.value}g
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                  {bars.map((b) => (
                    <div key={b.label} className={cn("h-full transition-all duration-700", b.color)} style={{ width: `${b.pct}%` }} />
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      </div>

      {/* meal list */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {meals.length} {t("history.mealsLogged")}
        </p>
        {meals.map((meal) => (
          <MealRow
            key={meal.id}
            meal={meal}
            onDelete={onDeleteMeal}
            isDeleting={deletingId === meal.id}
          />
        ))}
      </div>
    </div>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const { t } = useTranslation()
  const { token } = useAppSelector((state) => state.auth)
  const queryClient = useQueryClient()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["meals", token],
    queryFn: () => getMeals(token!, { limit: 500 }),
    enabled: !!token,
  })

  const { mutate: doDelete, isPending: isDeleting, variables: deletingId } = useMutation({
    mutationFn: (id: string) => deleteMeal(id, token!),
    onSuccess: () => {
      toast.success("Meal deleted")
      queryClient.invalidateQueries({ queryKey: ["meals"] })
      setConfirmDeleteId(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const meals = useMemo(() => data?.items ?? [], [data?.items])

  // group by date (YYYY-MM-DD), most recent first
  const grouped = useMemo(() => {
    const filtered = meals.filter((m) =>
      (m.predicted_food ?? "").toLowerCase().includes(search.toLowerCase())
    )
    const map = new Map<string, Meal[]>()
    filtered.forEach((m) => {
      const key = format(parseISO(m.created_at), "yyyy-MM-dd")
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(m)
    })
    // sort each day's meals by time descending
    map.forEach((v) => v.sort((a, b) => b.created_at.localeCompare(a.created_at)))
    // sort dates descending
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a))
  }, [meals, search])

  const selectedMeals = useMemo(() => {
    if (!selectedDate) return []
    return grouped.find(([d]) => d === selectedDate)?.[1] ?? []
  }, [selectedDate, grouped])

  function handleDeleteRequest(id: string) {
    setConfirmDeleteId(id)
  }

  function handleDeleteConfirm() {
    if (confirmDeleteId) doDelete(confirmDeleteId)
  }

  // ── day detail view
  if (selectedDate) {
    return (
      <div className="space-y-6">
        <DayDetailPanel
          dateKey={selectedDate}
          meals={selectedMeals}
          onClose={() => setSelectedDate(null)}
          onDeleteMeal={handleDeleteRequest}
          deletingId={isDeleting ? deletingId ?? null : null}
          t={t}
        />

        {/* delete confirm */}
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-xl">
              <h2 className="mb-2 text-base font-semibold">{t("history.confirmDelete")}</h2>
              <p className="mb-6 text-sm text-muted-foreground">{t("history.deleteDesc")}</p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(null)}>
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDeleting}
                  onClick={handleDeleteConfirm}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  {isDeleting ? t("common.loading") : t("history.delete")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── main grouped list view
  return (
    <div className="space-y-5">
      <PageHeader title={t("history.title")} description={t("history.subtitle")} />

      {/* search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("history.search")}
          className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* summary strip */}
      {!isLoading && meals.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3.5 text-primary" />
            <span className="font-medium text-foreground">{grouped.length}</span> {t("history.daysTracked")}
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <UtensilsCrossed className="size-3.5 text-primary" />
            <span className="font-medium text-foreground">{meals.length}</span> {t("history.totalMeals")}
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <Flame className="size-3.5 text-orange-400" />
            <span className="font-medium text-foreground">
              {Math.round(meals.reduce((s, m) => s + m.nutrition.calories, 0))}
            </span> {t("history.totalKcal")}
          </div>
        </div>
      )}

      {/* loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      )}

      {/* empty */}
      {!isLoading && grouped.length === 0 && (
        <EmptyState
          icon={UtensilsCrossed}
          title={search ? "No meals match your search" : t("history.empty")}
          description={search ? "Try a different search term" : t("history.emptyDesc")}
          action={search ? undefined : { label: "Scan a meal", onClick: () => router.push("/scan") }}
        />
      )}

      {/* grouped date sections */}
      {!isLoading && grouped.length > 0 && (
        <div className="space-y-3">
          {grouped.map(([dateKey, dateMeals], idx) => (
            <DateGroup
              key={dateKey}
              dateKey={dateKey}
              meals={dateMeals}
              onDeleteMeal={handleDeleteRequest}
              deletingId={isDeleting ? deletingId ?? null : null}
              defaultOpen={idx === 0}
              onDateClick={setSelectedDate}
              t={t}
            />
          ))}
        </div>
      )}

      {/* delete confirm modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-xl">
            <h2 className="mb-2 text-base font-semibold">{t("history.confirmDelete")}</h2>
            <p className="mb-6 text-sm text-muted-foreground">{t("history.deleteDesc")}</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(null)}>
                {t("common.cancel")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {isDeleting ? t("common.loading") : t("history.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
