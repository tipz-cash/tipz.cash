"use client"

import { useState, useEffect, useRef } from "react"

const SCRAMBLE_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"

export function useTextScramble(text: string, duration: number = 500) {
  const [displayText, setDisplayText] = useState(text)
  const previousText = useRef(text)

  useEffect(() => {
    // Only scramble if text actually changed
    if (text === previousText.current) {
      return
    }
    previousText.current = text

    let iteration = 0
    const totalIterations = text.length * 3 // 3 iterations per character
    const intervalTime = duration / totalIterations

    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            // Keep spaces as spaces
            if (char === " ") return " "
            // Characters that have been "decoded"
            if (index < iteration / 3) return text[index]
            // Random scramble character
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
          })
          .join("")
      )

      if (iteration >= totalIterations) {
        clearInterval(interval)
        setDisplayText(text)
      }
      iteration += 1
    }, intervalTime)

    return () => clearInterval(interval)
  }, [text, duration])

  return displayText
}
