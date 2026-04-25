"use client"

import { Download } from "lucide-react"
import { usePwaInstall } from "@/hooks/use-pwa-install"
import { Button } from "@/components/ui/button"

export function InstallPrompt() {
  const { canInstall, install } = usePwaInstall()

  if (!canInstall) return null

  return (
    <div className="fixed bottom-11 right-2 z-50 hidden md:block">
      <Button
        onClick={install}
        className="flex items-center gap-2 shadow-lg"
        size="sm"
      >
        <Download className="size-4" />
        Install App
      </Button>
    </div>
  )
}
