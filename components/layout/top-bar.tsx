"use client"

import Link from "next/link"
import { ScanLine, BarChart2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useAppSelector } from "@/hooks/use-app-store"
import { useTranslation } from "@/lib/i18n/use-translation"
import { getUserProgress } from "@/features/profile/profile.api"
import { LanguageSwitcher } from "@/components/i18n/language-switcher"
import { Logo } from "@/components/logo/logo"
import { Button } from "@/components/ui/button"

export function TopBar() {
  const { user, token } = useAppSelector((state) => state.auth)
  const { t } = useTranslation()
  const { data: progress } = useQuery({
    queryKey: ["userProgress", token],
    queryFn: () => getUserProgress(token!),
    enabled: !!token,
  })

  const firstName = user?.full_name?.split(" ")[0] ?? "there"
  const hours = new Date().getHours()
  const greeting = hours < 12 ? "Good morning" : hours < 17 ? "Good afternoon" : "Good evening"
  const topBadge = progress?.badges
    ?.filter((badge) => badge.unlocked)
    .sort((left, right) => right.progress_target - left.progress_target)[0]

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80">
      {/* Desktop left */}
      <div className="hidden flex-1 md:flex">
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-foreground">
            {greeting}, <span className="text-primary">{firstName}</span> 👋
          </p>
          {progress ? (
            <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
              Level {progress.level} · {progress.streak_days} day streak
            </span>
          ) : null}
          {topBadge ? (
            <span className="rounded-md bg-primary/8 px-2 py-1 text-xs text-primary">
              {topBadge.label}
            </span>
          ) : null}
        </div>
      </div>

      {/* Mobile left */}
      <div className="flex flex-1 items-center md:hidden">
        <Logo size={30} />
      </div>

      {/* Desktop right */}
      <div className="hidden items-center gap-2 md:flex">
        <LanguageSwitcher />
        <Link href="/reports">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <BarChart2 className="size-4" />
            Weekly insight
          </Button>
        </Link>
        <Link href="/scan">
          <Button size="sm" className="gap-1.5">
            <ScanLine className="size-4" />
            Quick Scan
          </Button>
        </Link>
      </div>

      {/* Mobile right */}
      <div className="flex items-center gap-2 md:hidden">
        <LanguageSwitcher />
      </div>
    </header>
  )
}
