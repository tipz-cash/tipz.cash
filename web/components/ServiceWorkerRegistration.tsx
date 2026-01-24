"use client"

import { useEffect } from "react"

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("TIPZ: Service worker registered", registration.scope)
        })
        .catch((error) => {
          console.error("TIPZ: Service worker registration failed", error)
        })
    }
  }, [])

  return null
}
