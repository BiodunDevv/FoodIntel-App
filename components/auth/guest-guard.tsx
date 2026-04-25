"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAppSelector } from "@/hooks/use-app-store"
import { LogoMark } from "@/components/logo/logo"

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { token, hydrated } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (hydrated && token) {
      router.replace("/dashboard")
    }
  }, [hydrated, token, router])

  if (!hydrated || token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LogoMark size={40} animated className="text-primary" />
      </div>
    )
  }

  return <>{children}</>
}
