"use client"

import Link from "next/link"
import { Zap } from "lucide-react"

import { Button } from "@/components/ui/button"

const logos = [
  "Nigerian meals",
  "Smart scoring",
  "Weekly insight",
  "Fast scan",
  "PWA ready",
  "Daily streaks",
]

export function FixedMarqueeBar() {
  const items = [...logos, ...logos]

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-2 pb-2">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-3">
        <div className="pointer-events-auto marquee-mask flex min-w-0 flex-1 items-center overflow-hidden rounded-lg bg-white/92 px-4 py-2 shadow-[0_10px_30px_rgba(17,24,39,0.08)] backdrop-blur">
          <div className="marquee-track flex items-center gap-8 pr-8 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {items.map((item, index) => (
              <div key={`${item}-${index}`} className="flex items-center gap-3 whitespace-nowrap">
                <span className="font-medium text-foreground/85">{item}</span>
                <Zap className="size-3.5 text-primary" />
              </div>
            ))}
          </div>
        </div>
        <div className="pointer-events-auto flex items-center justify-between gap-3 rounded-lg bg-[#22231f] px-2 py-1 text-white shadow-[0_14px_30px_rgba(17,24,39,0.18)] md:justify-start">
          <span className="truncate font-mono text-[11px] uppercase tracking-[0.18em] text-white/88">
            Try the speed of FoodIntel
          </span>
          <Button asChild size="sm" className="h-7 rounded-md bg-primary px-3 text-primary-foreground hover:bg-primary/90">
            <Link href="/register">
              <Zap className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
