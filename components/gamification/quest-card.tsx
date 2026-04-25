import { CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Quest {
  id: string
  label: string
  completed: boolean
  xp: number
}

interface QuestCardProps {
  quests: Quest[]
  className?: string
}

export function QuestCard({ quests, className }: QuestCardProps) {
  const completedCount = quests.filter((q) => q.completed).length

  return (
    <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-card-foreground">Daily Quests</h3>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{quests.length}
        </span>
      </div>
      <ul className="space-y-2">
        {quests.map((quest) => (
          <li key={quest.id} className="flex items-center gap-3">
            {quest.completed ? (
              <CheckCircle2 className="size-4 shrink-0 text-green-500" />
            ) : (
              <Circle className="size-4 shrink-0 text-muted-foreground" />
            )}
            <span className={cn("flex-1 text-xs", quest.completed ? "text-muted-foreground line-through" : "text-foreground")}>
              {quest.label}
            </span>
            <span className="text-[10px] font-semibold text-primary">+{quest.xp} XP</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
