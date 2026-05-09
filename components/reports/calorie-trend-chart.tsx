"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { cn } from "@/lib/utils"

interface DayData {
  date: string
  calories: number
  meals?: number
}

interface CalorieTrendChartProps {
  data: DayData[]
  className?: string
}

export function CalorieTrendChart({ data, className }: CalorieTrendChartProps) {
  // Only plot days that have data, or show sparse x-axis if > 14 days
  const formatted = data.map((d) => {
    const dateObj = new Date(d.date + "T00:00:00")
    return {
      ...d,
      label: data.length <= 14
        ? dateObj.toLocaleDateString("en", { month: "short", day: "numeric" })
        : String(dateObj.getDate()),
    }
  })

  // Show only every Nth tick to avoid crowding on monthly view
  const tickInterval = data.length > 20 ? 4 : data.length > 10 ? 2 : 1

  const avg =
    formatted.length > 0
      ? Math.round(formatted.reduce((s, d) => s + d.calories, 0) / formatted.filter((d) => d.calories > 0).length || 0)
      : 0

  return (
    <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-card-foreground">Calorie Trend</h3>
          <p className="text-xs text-muted-foreground">Daily calorie intake</p>
        </div>
        {avg > 0 && (
          <div className="rounded-md bg-primary/10 px-2 py-1 text-right">
            <p className="text-xs font-semibold text-primary">{avg} kcal</p>
            <p className="text-[10px] text-muted-foreground">avg / day</p>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={formatted} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="calorieGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.22} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
            interval={tickInterval - 1}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          {avg > 0 && (
            <ReferenceLine
              y={avg}
              stroke="var(--color-primary)"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
            />
          )}
          <Tooltip
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              fontSize: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            labelStyle={{ color: "var(--color-foreground)", fontWeight: 600 }}
            itemStyle={{ color: "var(--color-primary)" }}
            formatter={(value) => [`${value} kcal`, "Calories"]}
          />
          <Area
            type="monotone"
            dataKey="calories"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#calorieGrad)"
            dot={false}
            activeDot={{ fill: "var(--color-primary)", r: 4, strokeWidth: 2, stroke: "var(--color-card)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
