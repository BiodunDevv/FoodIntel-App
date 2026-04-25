import { cn } from "@/lib/utils"

interface XpRingProps {
  xp: number
  xpForNextLevel: number
  level: number
  className?: string
}

export function XpRing({ xp, xpForNextLevel, level, className }: XpRingProps) {
  const pct = Math.min(100, (xp / xpForNextLevel) * 100)
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative size-24">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-muted-foreground">LVL</span>
          <span className="text-xl font-bold text-primary">{level}</span>
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {xp} / {xpForNextLevel} XP
      </p>
    </div>
  )
}
