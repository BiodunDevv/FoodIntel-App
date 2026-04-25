"use client"

import { useEffect } from "react"

export function PwaBootstrap() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Ignore registration errors in development environments that do not support SW well.
    })
  }, [])

  return null
}
