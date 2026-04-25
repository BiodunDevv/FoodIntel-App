"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Menu, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useAppSelector } from "@/hooks/use-app-store"
import { Logo } from "@/components/logo/logo"
import { LanguageSwitcher } from "@/components/i18n/language-switcher"
import { Button } from "@/components/ui/button"

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#product", label: "Product" },
  { href: "#progress", label: "Progress" },
]

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { token, user, hydrated } = useAppSelector((state) => state.auth)
  const isLoggedIn = hydrated && Boolean(token)
  const firstName = user?.full_name?.split(" ")[0] ?? "there"

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/92 shadow-[0_1px_0_rgba(0,0,0,0.06),0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <div className="container-shell flex h-16 items-center justify-between gap-8">
        {/* Left — logo */}
        <Logo size={30} />

        {/* Center — nav links */}
        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Right — language + auth */}
        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <div className="h-4 w-px bg-border/60" />
          {isLoggedIn ? (
            <>
              <div className="rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground">
                Welcome, <span className="font-medium text-foreground">{firstName}</span>
              </div>
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
                <Link href="/dashboard">
                  Open dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-4 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Sign in
                </Button>
              </Link>
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
                <Link href="/register">
                  Start scanning
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex size-9 items-center justify-center text-foreground transition-colors hover:bg-muted/60 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-border/40 bg-background/96 backdrop-blur-md md:hidden">
          <div className="container-shell py-4 space-y-1">
            <nav className="flex flex-col">
              {NAV_LINKS.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
                >
                  {label}
                </a>
              ))}
            </nav>

            <div className="pt-3 border-t border-border/40 space-y-2">
              <div className="px-1">
                <LanguageSwitcher />
              </div>
              {isLoggedIn ? (
                <>
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Welcome, <span className="font-medium text-foreground">{firstName}</span>
                  </div>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
                      Open dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start rounded-lg font-medium">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
                      Start scanning
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
