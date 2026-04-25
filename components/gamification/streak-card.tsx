import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"

interface StreakCardProps {
  streak: number
  className?: string
}

export function StreakCard({ streak, className }: StreakCardProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
          <Flame className="size-5 text-orange-500" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{streak}</p>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </div>
      </div>
      {streak > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          {streak >= 7
            ? "🔥 You're on fire! Keep it up!"
            : streak >= 3
              ? "Great consistency! Keep going!"
              : "Good start! Don't break the chain!"}
        </p>
      )}
    </div>
  )
}
