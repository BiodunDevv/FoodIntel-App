"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ScanLine,
  History,
  BarChart2,
  User,
  Settings,
  Download,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo/logo"
import { LogoutDialog } from "@/components/layout/logout-dialog"
import { useAppSelector } from "@/hooks/use-app-store"
import { usePwaInstall } from "@/hooks/use-pwa-install"
import { useTranslation } from "@/lib/i18n/use-translation"
import { Button } from "@/components/ui/button"

const NAV_ITEMS = [
  { href: "/dashboard", label: "nav.dashboard", icon: LayoutDashboard },
  { href: "/scan", label: "nav.scan", icon: ScanLine, badge: "Quick" },
  { href: "/history", label: "nav.history", icon: History },
  { href: "/reports", label: "nav.reports", icon: BarChart2 },
  { href: "/profile", label: "nav.profile", icon: User },
  { href: "/settings", label: "nav.settings", icon: Settings },
]

export function DesktopSidebar() {
  const pathname = usePathname()
  const user = useAppSelector((state) => state.auth.user)
  const { canInstall, install } = usePwaInstall()
  const { t } = useTranslation()

  const firstName = user?.full_name?.split(" ")[0] ?? "User"
  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-sidebar md:flex">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href="/" className="inline-flex items-center">
          <Logo size={28} />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/")
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="flex-1">{t(label)}</span>
                  {badge && !isActive && (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      {badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
        {canInstall && (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={install}
          >
            <Download className="size-4" />
            Install app
          </Button>
        )}

      {/* Bottom */}
      <div className="space-y-2 border-t border-border p-3">
        <div className="flex items-center gap-2 px-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-sidebar-foreground">
              {user?.full_name ?? firstName}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              {user?.email ?? ""}
            </p>
          </div>
          <LogoutDialog />
        </div>
      </div>
    </aside>
  )
}
