import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface RecommendationCardProps {
  recommendations: string[]
  className?: string
}

export function RecommendationCard({ recommendations, className }: RecommendationCardProps) {
  if (!recommendations || recommendations.length === 0) return null

  return (
    <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <h3 className="mb-3 text-sm font-semibold text-card-foreground">Recommendations</h3>
      <ul className="space-y-2">
        {recommendations.map((rec, i) => (
          <li key={i} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
            <span className="text-sm text-foreground">{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
