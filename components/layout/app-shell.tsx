"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useAppSelector, useAppDispatch } from "@/hooks/use-app-store"
import { clearAuthState, setCurrentUser } from "@/store/slices/auth-slice"
import { getCurrentUser } from "@/features/profile/profile.api"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { MobileTabBar } from "@/components/layout/mobile-tab-bar"
import { TopBar } from "@/components/layout/top-bar"
import { LogoMark } from "@/components/logo/logo"
import { OfflineBanner } from "@/components/pwa/offline-banner"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { token, hydrated } = useAppSelector((state) => state.auth)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["currentUser", token],
    queryFn: () => getCurrentUser(token!),
    enabled: !!token && hydrated,
    retry: false,
  })

  useEffect(() => {
    if (profile) {
      dispatch(setCurrentUser(profile))
    }
  }, [profile, dispatch])

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/login")
    }
  }, [hydrated, token, router])

  useEffect(() => {
    if (hydrated && token && isError) {
      dispatch(clearAuthState())
      router.replace("/login")
    }
  }, [dispatch, hydrated, isError, router, token])

  if (!mounted || !hydrated || (hydrated && !token)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LogoMark size={48} animated className="text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      <div className="flex min-h-screen flex-col md:pl-60">
        <TopBar />
        <OfflineBanner />
        <main className="flex-1 p-4 pb-20 md:p-6 md:pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <LogoMark size={40} animated className="text-primary" />
            </div>
          ) : (
            children
          )}
        </main>
        <MobileTabBar />
      </div>
    </div>
  )
}
