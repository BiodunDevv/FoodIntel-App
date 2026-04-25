import { Trophy, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

interface Achievement {
  id: string
  label: string
  description: string
  unlocked: boolean
  progress_current?: number
  progress_target?: number
}

interface AchievementCardProps {
  achievements: Achievement[]
  className?: string
}

export function AchievementCard({ achievements, className }: AchievementCardProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <h3 className="mb-3 text-sm font-semibold text-card-foreground">Achievements</h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={cn(
              "rounded-lg border p-3 transition-colors",
              ach.unlocked
                ? "border-primary/20 bg-primary/5"
                : "border-border bg-muted/40"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full",
                ach.unlocked ? "bg-primary/10" : "bg-background"
              )}>
                {ach.unlocked ? (
                  <Trophy className="size-4 text-primary" />
                ) : (
                  <Lock className="size-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{ach.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{ach.description}</p>
                {typeof ach.progress_current === "number" && typeof ach.progress_target === "number" ? (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {ach.progress_current}/{ach.progress_target}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
