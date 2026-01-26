"use client"

import { useState, useEffect, useRef } from "react"

// Words that light up in rows/columns
const HIGHLIGHT_WORDS = ["ZCASH", "TIPZ", "PRIVATE", "0FEES", "ZEC", "TIP", "INSTANT"]
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const COLS = 90
const ROWS = 60

interface Cell {
  char: string
  nextChar: string
  morphProgress: number // 0 = showing char, 1 = showing nextChar
  brightness: number
  isHighlight: boolean
  highlightBrightness: number
}

export function LetterGridBackground() {
  const [grid, setGrid] = useState<Cell[][]>([])

  // Initialize grid
  useEffect(() => {
    const initialGrid: Cell[][] = []
    for (let row = 0; row < ROWS; row++) {
      const rowCells: Cell[] = []
      for (let col = 0; col < COLS; col++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)]
        rowCells.push({
          char,
          nextChar: char,
          morphProgress: 0,
          brightness: 0.3 + Math.random() * 0.5,
          isHighlight: false,
          highlightBrightness: 0,
        })
      }
      initialGrid.push(rowCells)
    }
    setGrid(initialGrid)
  }, [])

  // Animation loop
  useEffect(() => {
    if (grid.length === 0) return

    const interval = setInterval(() => {
      setGrid(prev => {
        const newGrid = prev.map(row => row.map(cell => ({ ...cell })))

        for (let row = 0; row < ROWS; row++) {
          for (let col = 0; col < COLS; col++) {
            const cell = newGrid[row][col]

            // Progress morph animation (smooth transitions)
            if (cell.morphProgress > 0 && cell.morphProgress < 1) {
              cell.morphProgress = Math.min(1, cell.morphProgress + 0.15)
              if (cell.morphProgress >= 1) {
                cell.char = cell.nextChar
                cell.morphProgress = 0
              }
            }

            // Start new morph - ALL letters constantly changing (100% probability)
            if (cell.morphProgress === 0 && !cell.isHighlight) {
              cell.nextChar = CHARS[Math.floor(Math.random() * CHARS.length)]
              cell.morphProgress = 0.01
            }

            // Gentle brightness drift
            if (!cell.isHighlight) {
              const drift = (Math.random() - 0.5) * 0.08
              cell.brightness = Math.max(0.2, Math.min(0.8, cell.brightness + drift))
            }

            // Smooth highlight fade (quick fade out after brief hold)
            if (cell.isHighlight) {
              cell.highlightBrightness = Math.min(1, cell.highlightBrightness + 0.2)
            } else if (cell.highlightBrightness > 0) {
              cell.highlightBrightness = Math.max(0, cell.highlightBrightness - 0.12)
            }
          }
        }

        // Insert word - spawn multiple across grid
        if (Math.random() < 0.09) {
          // Spawn 1-3 words at once across different areas
          const numWords = 1 + Math.floor(Math.random() * 3)
          for (let w = 0; w < numWords; w++) {
            const word = HIGHLIGHT_WORDS[Math.floor(Math.random() * HIGHLIGHT_WORDS.length)]
            const isHorizontal = Math.random() > 0.5

            if (isHorizontal) {
              const row = Math.floor(Math.random() * ROWS)
              const startCol = Math.floor(Math.random() * (COLS - word.length))
              for (let i = 0; i < word.length; i++) {
                newGrid[row][startCol + i].char = word[i]
                newGrid[row][startCol + i].nextChar = word[i]
                newGrid[row][startCol + i].morphProgress = 0
                newGrid[row][startCol + i].isHighlight = true
              }
            } else {
              const col = Math.floor(Math.random() * COLS)
              const startRow = Math.floor(Math.random() * (ROWS - word.length))
              for (let i = 0; i < word.length; i++) {
                newGrid[startRow + i][col].char = word[i]
                newGrid[startRow + i][col].nextChar = word[i]
                newGrid[startRow + i][col].morphProgress = 0
                newGrid[startRow + i][col].isHighlight = true
              }
            }
          }
        }

        // Random letter sparks - instant flash then gone
        if (Math.random() < 0.2) {
          const numSparks = 3 + Math.floor(Math.random() * 6)
          for (let s = 0; s < numSparks; s++) {
            const row = Math.floor(Math.random() * ROWS)
            const col = Math.floor(Math.random() * COLS)
            if (!newGrid[row][col].isHighlight) {
              // Don't set isHighlight - just flash brightness directly so it fades immediately
              newGrid[row][col].highlightBrightness = 0.5 + Math.random() * 0.5
            }
          }
        }

        // Clear old highlights (brief hold then fade - just enough to read)
        for (let row = 0; row < ROWS; row++) {
          for (let col = 0; col < COLS; col++) {
            if (newGrid[row][col].isHighlight && newGrid[row][col].highlightBrightness >= 0.95) {
              if (Math.random() < 0.08) {
                newGrid[row][col].isHighlight = false
              }
            }
          }
        }

        return newGrid
      })
    }, 25) // ~40fps for smoother updates

    return () => clearInterval(interval)
  }, [grid.length])

  if (grid.length === 0) return null

  return (
    <div style={styles.container}>
      <style>{cssStyles}</style>
      <div style={styles.grid}>
        {grid.map((row, rowIdx) =>
          row.map((cell, colIdx) => {
            const isGlowing = cell.highlightBrightness > 0.05
            const baseOpacity = cell.brightness * 0.32
            const glowOpacity = cell.highlightBrightness * 0.7
            const morphOpacity = cell.morphProgress > 0 ? 1 - Math.abs(cell.morphProgress - 0.5) * 0.6 : 1
            const displayChar = cell.morphProgress >= 0.5 ? cell.nextChar : cell.char

            return (
              <span
                key={`${rowIdx}-${colIdx}`}
                className="grid-letter"
                style={{
                  color: isGlowing
                    ? `rgba(255, 215, 0, ${glowOpacity})`
                    : `rgba(255, 255, 255, ${baseOpacity * morphOpacity})`,
                  textShadow: isGlowing
                    ? `0 0 ${6 + glowOpacity * 12}px rgba(255, 215, 0, ${glowOpacity * 0.7})`
                    : "none",
                  transform: `scale(${0.9 + (isGlowing ? glowOpacity * 0.15 : 0)})`,
                }}
              >
                {displayChar}
              </span>
            )
          })
        )}
      </div>
    </div>
  )
}

const cssStyles = `
  .grid-letter {
    transition: color 0.15s ease-out, text-shadow 0.2s ease-out, transform 0.15s ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    .grid-letter {
      transition: none !important;
    }
  }
`

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    pointerEvents: "none",
    zIndex: 0,
  },
  grid: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "grid",
    gridTemplateColumns: `repeat(${COLS}, 1fr)`,
    gridTemplateRows: `repeat(${ROWS}, 1fr)`,
    width: "140vw",
    height: "140vh",
    gap: "1px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "clamp(8px, 1vw, 12px)",
    fontWeight: 500,
    textAlign: "center",
    lineHeight: 1,
    maskImage: `radial-gradient(
      circle at 50% 50%,
      transparent 0%,
      transparent 16%,
      rgba(0,0,0,1) 22%,
      rgba(0,0,0,1) 100%
    )`,
    WebkitMaskImage: `radial-gradient(
      circle at 50% 50%,
      transparent 0%,
      transparent 16%,
      rgba(0,0,0,1) 22%,
      rgba(0,0,0,1) 100%
    )`,
  },
}
