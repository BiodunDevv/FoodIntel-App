"use client"

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

interface MacroBreakdown {
  protein: number
  carbs: number
  fat: number
}

interface MacroChartProps {
  data: MacroBreakdown
  className?: string
}

const COLORS = ["#3b82f6", "#eab308", "#f97316"]

export function MacroChart({ data, className }: MacroChartProps) {
  const chartData = [
    { name: "Protein", value: data.protein },
    { name: "Carbs", value: data.carbs },
    { name: "Fat", value: data.fat },
  ]

  const total = data.protein + data.carbs + data.fat

  return (
    <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <h3 className="mb-4 text-sm font-semibold text-card-foreground">Macro Breakdown</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 6,
              fontSize: 12,
            }}
            formatter={(value, name) => {
              const v = typeof value === "number" ? value : 0
              return [`${v}g (${total > 0 ? Math.round((v / total) * 100) : 0}%)`, String(name)]
            }}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
