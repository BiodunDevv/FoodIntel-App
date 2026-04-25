import { cn } from "@/lib/utils"

interface LevelProgressProps {
  level: number
  xp: number
  xpForNextLevel: number
  className?: string
}

export function LevelProgress({ level, xp, xpForNextLevel, className }: LevelProgressProps) {
  const pct = Math.min(100, (xp / xpForNextLevel) * 100)

  return (
    <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {level}
          </div>
          <span className="text-sm font-semibold text-foreground">Level {level}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {xp} / {xpForNextLevel} XP
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">{xpForNextLevel - xp} XP to next level</p>
    </div>
  )
}
