import { useState, useCallback } from "react"

/**
 * Manages avatar image error handling with a single retry (cache-bust).
 * On first error: retries with ?_retry=1 appended.
 * On second error: sets imgFailed = true so the caller can show a fallback.
 */
export function useAvatarFallback(avatarUrl: string | null | undefined) {
  const [imgFailed, setImgFailed] = useState(false)
  const [retried, setRetried] = useState(false)

  const onImgError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (!retried && avatarUrl) {
        // First failure — retry with cache-bust param
        setRetried(true)
        const sep = avatarUrl.includes("?") ? "&" : "?"
        e.currentTarget.src = `${avatarUrl}${sep}_retry=1`
      } else {
        // Second failure — give up, show fallback
        setImgFailed(true)
      }
    },
    [retried, avatarUrl]
  )

  return { imgFailed, onImgError }
}
