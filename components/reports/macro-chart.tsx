"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

interface MacroBreakdown {
  protein: number
  carbs: number
  fat: number
  fiber?: number
}

interface MacroChartProps {
  data: MacroBreakdown
  className?: string
}

const MACROS = [
  { key: "protein" as const, label: "Protein", color: "#3b82f6", bg: "bg-blue-500" },
  { key: "carbs" as const, label: "Carbs", color: "#eab308", bg: "bg-yellow-500" },
  { key: "fat" as const, label: "Fat", color: "#f97316", bg: "bg-orange-500" },
]

export function MacroChart({ data, className }: MacroChartProps) {
  const chartData = MACROS.map((m) => ({ name: m.label, value: Math.round(data[m.key] ?? 0), color: m.color }))
  const total = chartData.reduce((s, d) => s + d.value, 0)

  if (total === 0) {
    return (
      <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
        <h3 className="mb-4 text-sm font-semibold text-card-foreground">Macro Split</h3>
        <p className="text-center text-sm text-muted-foreground py-8">No data</p>
      </div>
    )
  }

  return (
    <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-card-foreground">Macro Split</h3>
        <p className="text-xs text-muted-foreground">Total: {total}g across protein, carbs & fat</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Donut */}
        <div className="relative shrink-0">
          <ResponsiveContainer width={130} height={130}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={62}
                paddingAngle={2}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                strokeWidth={0}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                formatter={(value, name) => {
                  const v = typeof value === "number" ? value : 0
                  return [`${v}g · ${total > 0 ? Math.round((v / total) * 100) : 0}%`, name]
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-bold text-foreground">{total}g</span>
            <span className="text-[10px] text-muted-foreground">total</span>
          </div>
        </div>

        {/* Legend bars */}
        <div className="flex-1 space-y-2.5">
          {chartData.map((item, i) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
            return (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className={cn("size-2 rounded-full", MACROS[i].bg)} />
                    <span className="text-xs text-foreground">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-foreground">{item.value}g</span>
                    <span className="w-7 text-right text-[10px] text-muted-foreground">{pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
