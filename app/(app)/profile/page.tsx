"use client"

import { useEffect } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { getCurrentUser, getUserProgress, updateProfile } from "@/features/profile/profile.api"
import { useAppSelector } from "@/hooks/use-app-store"
import { useTranslation } from "@/lib/i18n/use-translation"
import { PageHeader } from "@/components/shared/page-header"
import { AchievementCard } from "@/components/gamification/achievement-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const schema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.string().optional(),
  height_cm: z.string().optional(),
  weight_kg: z.string().optional(),
  goal: z.string().optional(),
  activity_level: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const GOALS = [
  { value: "lose_weight", labelKey: "profile.goal.loseWeight" },
  { value: "maintain", labelKey: "profile.goal.maintain" },
  { value: "gain_muscle", labelKey: "profile.goal.gainMuscle" },
  { value: "eat_healthier", labelKey: "profile.goal.eatHealthier" },
]

const ACTIVITY_LEVELS = [
  { value: "sedentary", labelKey: "profile.activity.sedentary" },
  { value: "lightly_active", labelKey: "profile.activity.lightlyActive" },
  { value: "moderately_active", labelKey: "profile.activity.moderatelyActive" },
  { value: "very_active", labelKey: "profile.activity.veryActive" },
]

export default function ProfilePage() {
  const { t } = useTranslation()
  const { token } = useAppSelector((state) => state.auth)

  const { data: profile, isLoading } = useQuery({
    queryKey: ["currentUser", token],
    queryFn: () => getCurrentUser(token!),
    enabled: !!token,
  })

  const { data: progress } = useQuery({
    queryKey: ["userProgress", token],
    queryFn: () => getUserProgress(token!),
    enabled: !!token,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name ?? "",
        age: profile.age ? String(profile.age) : "",
        height_cm: profile.height_cm ? String(profile.height_cm) : "",
        weight_kg: profile.weight_kg ? String(profile.weight_kg) : "",
        goal: profile.goal ?? "",
        activity_level: profile.activity_level ?? "",
      })
    }
  }, [profile, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      updateProfile(
        {
          full_name: data.full_name,
          age: data.age ? Number(data.age) : undefined,
          height_cm: data.height_cm ? Number(data.height_cm) : undefined,
          weight_kg: data.weight_kg ? Number(data.weight_kg) : undefined,
          goal: data.goal ?? undefined,
          activity_level: data.activity_level ?? undefined,
        },
        token!
      ),
    onSuccess: () => toast.success(t("profile.savedSuccess")),
    onError: (err: Error) => toast.error(err.message),
  })

  const inputClass = (hasError: boolean) =>
    cn(
      "w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring",
      hasError ? "border-destructive" : "border-input"
    )

  return (
    <div className="space-y-6">
      <PageHeader title={t("profile.title")} description={t("profile.subtitle")} />

      {progress ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Level</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{progress.level}</p>
            <p className="mt-1 text-xs text-muted-foreground">{progress.xp_total} XP total</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Streak</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{progress.streak_days} days</p>
            <p className="mt-1 text-xs text-muted-foreground">{progress.total_scans} meals logged</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Model feedback</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{progress.feedback_count}</p>
            <p className="mt-1 text-xs text-muted-foreground">{progress.correction_count} corrections submitted</p>
          </div>
        </div>
      ) : null}

      {progress?.badges?.length ? <AchievementCard achievements={progress.badges} /> : null}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-5">
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-card-foreground">Personal Info</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-foreground">{t("profile.fullName")}</label>
                <input {...register("full_name")} className={inputClass(!!errors.full_name)} placeholder="John Doe" />
                {errors.full_name && <p className="mt-1 text-xs text-destructive">{errors.full_name.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">{t("profile.age")}</label>
                <input {...register("age")} type="number" className={inputClass(!!errors.age)} placeholder="25" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">{t("profile.height")}</label>
                <input {...register("height_cm")} type="number" className={inputClass(!!errors.height_cm)} placeholder="170" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">{t("profile.weight")}</label>
                <input {...register("weight_kg")} type="number" className={inputClass(!!errors.weight_kg)} placeholder="70" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-card-foreground">Goals & Activity</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">{t("profile.goal")}</label>
                <select
                  {...register("goal")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Select goal</option>
                  {GOALS.map(({ value, labelKey }) => (
                    <option key={value} value={value}>{t(labelKey)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">{t("profile.activityLevel")}</label>
                <select
                  {...register("activity_level")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Select activity level</option>
                  {ACTIVITY_LEVELS.map(({ value, labelKey }) => (
                    <option key={value} value={value}>{t(labelKey)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending ? t("profile.saving") : t("profile.save")}
          </Button>
        </form>
      )}
    </div>
  )
}
