"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Eye, Search, Trash2, UtensilsCrossed } from "lucide-react"
import { format } from "date-fns"
import { getMeals, deleteMeal } from "@/features/meals/meals.api"
import { useAppSelector } from "@/hooks/use-app-store"
import { useTranslation } from "@/lib/i18n/use-translation"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { resolveMealImageUrl } from "@/lib/images"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function HistoryPage() {
  const { t } = useTranslation()
  const { token } = useAppSelector((state) => state.auth)
  const queryClient = useQueryClient()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["meals", token],
    queryFn: () => getMeals(token!, { limit: 50 }),
    enabled: !!token,
  })

  const { mutate: doDelete, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteMeal(id, token!),
    onSuccess: () => {
      toast.success("Meal deleted")
      queryClient.invalidateQueries({ queryKey: ["meals"] })
      setConfirmDeleteId(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const meals = data?.items ?? []
  const filtered = meals.filter((m) =>
    (m.predicted_food ?? "").toLowerCase().includes(search.toLowerCase())
  )

  const feedbackLabel = (meal: (typeof meals)[number]) => {
    if (!meal.feedback) return null
    if (meal.feedback.is_correct) return "Prediction confirmed"
    return `Corrected to ${meal.feedback.corrected_food}`
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("history.title")} description={t("history.subtitle")} />

      {/* Search */}
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

      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon={UtensilsCrossed}
          title={search ? "No meals match your search" : t("history.empty")}
          description={search ? "Try a different search term" : t("history.emptyDesc")}
          action={search ? undefined : { label: "Scan a meal", onClick: () => router.push("/scan") }}
        />
      )}

      {/* Meal list */}
      {!isLoading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((meal) => {
            const imageSrc = resolveMealImageUrl(meal.image_url)
            return (
            <div
              key={meal.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex gap-4">
                <div className="size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  {imageSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageSrc}
                      alt={meal.predicted_food}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <UtensilsCrossed className="size-5 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/result/${meal.id}`} className="min-w-0">
                          <p className="truncate text-sm font-semibold capitalize text-foreground">
                            {meal.predicted_food}
                          </p>
                        </Link>
                        <span
                          className={cn(
                            "rounded-md px-2 py-1 text-[11px] font-medium",
                            meal.health_score >= 70
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : meal.health_score >= 40
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          )}
                        >
                          Health {Math.round(meal.health_score)}
                        </span>
                        <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                          Confidence {Math.round(meal.confidence * 100)}%
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>{meal.nutrition.calories} kcal</span>
                        <span>{meal.serving_size_g}g serving</span>
                        <span>{format(new Date(meal.created_at), "MMM d, yyyy")}</span>
                      </div>

                      {feedbackLabel(meal) ? (
                        <p className="mt-2 text-xs text-foreground">
                          <span className="font-medium">Feedback:</span> {feedbackLabel(meal)}
                        </p>
                      ) : null}

                      {meal.feedback?.notes ? (
                        <p className="mt-1 text-xs text-muted-foreground">{meal.feedback.notes}</p>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <Link href={`/result/${meal.id}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="size-4" />
                          View result
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmDeleteId(meal.id)}
                        className="gap-2 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )
          })}
        </div>
      )}

      {/* Delete confirm dialog */}
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
                onClick={() => doDelete(confirmDeleteId)}
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
