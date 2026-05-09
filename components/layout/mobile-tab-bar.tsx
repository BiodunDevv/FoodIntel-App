"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, History, BarChart2, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n/use-translation"

const LEFT_TABS = [
  { href: "/dashboard", label: "nav.dashboard", icon: LayoutDashboard },
  { href: "/history", label: "nav.history", icon: History },
]

const RIGHT_TABS = [
  { href: "/reports", label: "nav.reports", icon: BarChart2 },
  { href: "/profile", label: "nav.profile", icon: User },
]

export function MobileTabBar() {
  const pathname = usePathname()
  const { t } = useTranslation()
  const scanActive = pathname === "/scan" || pathname.startsWith("/scan/")

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* floating bar */}
      <div className="mx-3 mb-3 flex h-[58px] items-center rounded-2xl border border-border/80 bg-background/96 shadow-[0_8px_32px_rgba(0,0,0,0.14)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/88">

        {/* left two tabs */}
        <div className="flex flex-1 items-center justify-around">
          {LEFT_TABS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center gap-[3px] px-4 py-2"
              >
                {isActive && (
                  <span className="absolute -top-0.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary" />
                )}
                <Icon
                  className={cn(
                    "size-[22px] transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium leading-none transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {t(label)}
                </span>
              </Link>
            )
          })}
        </div>

        {/* center scan button — raised circle */}
        <div className="relative flex w-20 shrink-0 justify-center">
          {/* outer glow ring */}
          <div
            className={cn(
              "absolute -top-6 flex size-[60px] items-center justify-center rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.18)] transition-transform active:scale-95",
              scanActive
                ? "bg-primary ring-4 ring-primary/20"
                : "bg-primary hover:bg-primary/90",
            )}
          >
            <Link
              href="/scan"
              aria-label={t("nav.scan")}
              className="flex size-full items-center justify-center rounded-full"
            >
              {/* custom camera/scan shape */}
              <svg
                viewBox="0 0 24 24"
                className="size-[26px] text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.9}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* camera body */}
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                {/* lens */}
                <circle cx="12" cy="13" r="4" />
              </svg>
            </Link>
          </div>
          {/* label under the raised button */}
          <span
            className={cn(
              "mt-auto pb-1.5 text-[10px] font-medium leading-none",
              scanActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            {t("nav.scan")}
          </span>
        </div>

        {/* right two tabs */}
        <div className="flex flex-1 items-center justify-around">
          {RIGHT_TABS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center gap-[3px] px-4 py-2"
              >
                {isActive && (
                  <span className="absolute -top-0.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary" />
                )}
                <Icon
                  className={cn(
                    "size-[22px] transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium leading-none transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {t(label)}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
