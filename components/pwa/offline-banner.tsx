"use client"

import { useEffect, useState } from "react"
import { WifiOff } from "lucide-react"

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const syncStatus = () => setIsOnline(window.navigator.onLine)

    syncStatus()
    window.addEventListener("online", syncStatus)
    window.addEventListener("offline", syncStatus)

    return () => {
      window.removeEventListener("online", syncStatus)
      window.removeEventListener("offline", syncStatus)
    }
  }, [])

  if (isOnline) {
    return null
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-amber-900">
      <div className="mx-auto flex max-w-6xl items-center gap-2 text-sm">
        <WifiOff className="size-4 shrink-0" />
        <span>
          You&apos;re offline. You can still browse cached screens, but live scans, reports, and sync
          actions will wait until your connection returns.
        </span>
      </div>
    </div>
  )
}
