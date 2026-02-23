"use client"

import { useState, useEffect } from "react"
import { breakpoints } from "@/lib/responsive"

interface ResponsiveState {
  width: number
  height: number
  isXs: boolean // < 375px
  isSm: boolean // < 428px (includes xs)
  isMobile: boolean // < 768px (includes xs, sm)
  isTablet: boolean // 768px - 1023px
  isDesktop: boolean // >= 1024px
  isTouch: boolean // Touch device detected
  isReducedMotion: boolean // User prefers reduced motion
}

/**
 * Unified responsive hook for TIPZ mobile optimization
 * Replaces scattered useIsMobile hooks with comprehensive state
 */
export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
    isXs: false,
    isSm: false,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouch: false,
    isReducedMotion: false,
  })

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      // Check touch capability
      const isTouch =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(hover: none) and (pointer: coarse)").matches

      // Check reduced motion preference
      const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

      setState({
        width,
        height,
        isXs: width < breakpoints.xs,
        isSm: width < breakpoints.sm,
        isMobile: width < breakpoints.md,
        isTablet: width >= breakpoints.md && width < breakpoints.lg,
        isDesktop: width >= breakpoints.lg,
        isTouch,
        isReducedMotion,
      })
    }

    // Initial update
    updateState()

    // Listen for resize
    window.addEventListener("resize", updateState)

    // Listen for reduced motion changes
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const handleMotionChange = () => updateState()
    motionQuery.addEventListener("change", handleMotionChange)

    return () => {
      window.removeEventListener("resize", updateState)
      motionQuery.removeEventListener("change", handleMotionChange)
    }
  }, [])

  return state
}

/**
 * Simple hook for just mobile detection (backward compatible)
 */
export function useIsMobile(): boolean {
  const { isMobile } = useResponsive()
  return isMobile
}

/**
 * Hook for getting current breakpoint name
 */
export function useBreakpoint(): "xs" | "sm" | "md" | "lg" | "xl" {
  const { width } = useResponsive()

  if (width < breakpoints.xs) return "xs"
  if (width < breakpoints.sm) return "sm"
  if (width < breakpoints.md) return "md"
  if (width < breakpoints.lg) return "lg"
  return "xl"
}
