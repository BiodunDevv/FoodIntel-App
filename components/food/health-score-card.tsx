import { cn } from "@/lib/utils"

interface HealthScoreCardProps {
  score: number
  className?: string
}

export function HealthScoreCard({ score, className }: HealthScoreCardProps) {
  const clamped = Math.max(0, Math.min(100, score))

  const color =
    clamped < 40
      ? { ring: "#ef4444", text: "text-red-500", label: "Poor" }
      : clamped < 70
        ? { ring: "#eab308", text: "text-yellow-500", label: "Fair" }
        : { ring: "#22c55e", text: "text-green-500", label: "Good" }

  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <h3 className="mb-4 text-sm font-semibold text-card-foreground">Health Score</h3>
      <div className="flex items-center gap-6">
        <div className="relative size-24">
          <svg viewBox="0 0 100 100" className="size-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-muted"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={color.ring}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-2xl font-bold", color.text)}>{clamped}</span>
            <span className="text-[10px] text-muted-foreground">/ 100</span>
          </div>
        </div>
        <div>
          <p className={cn("text-lg font-bold", color.text)}>{color.label}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {clamped < 40
              ? "Consider healthier alternatives"
              : clamped < 70
                ? "A balanced choice for most days"
                : "Excellent nutritional profile"}
          </p>
        </div>
      </div>
    </div>
  )
}
