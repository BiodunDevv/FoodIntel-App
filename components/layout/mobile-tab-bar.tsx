"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, History, ScanLine, BarChart2, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n/use-translation"

const TABS = [
  { href: "/dashboard", label: "nav.dashboard", icon: LayoutDashboard },
  { href: "/history", label: "nav.history", icon: History },
  { href: "/scan", label: "nav.scan", icon: ScanLine, emphasized: true },
  { href: "/reports", label: "nav.reports", icon: BarChart2 },
  { href: "/settings", label: "nav.settings", icon: Settings },
]

export function MobileTabBar() {
  const pathname = usePathname()
  const { t } = useTranslation()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {TABS.map(({ href, label, icon: Icon, emphasized }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/")

          if (emphasized) {
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-0.5"
              >
                <div
                  className={cn(
                    "flex size-11 items-center justify-center rounded-full transition-colors",
                    isActive ? "bg-primary" : "bg-primary/90 hover:bg-primary"
                  )}
                >
                  <Icon className="size-5 text-primary-foreground" />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-5" />
              <span className="text-[10px] font-medium">{t(label)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
