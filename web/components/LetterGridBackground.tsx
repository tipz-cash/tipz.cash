"use client"

import { useState, useEffect, useRef } from "react"

// Words that light up in rows/columns
const HIGHLIGHT_WORDS = ["ZCASH", "TIPZ", "PRIVATE", "0FEES", "ZEC", "TIP", "INSTANT"]
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
// Reduced grid size: 90×60 → 45×30 (4× fewer cells: 5400 → 1350)
const COLS = 45
const ROWS = 30

interface Cell {
  char: string
  nextChar: string
  morphProgress: number // 0 = showing char, 1 = showing nextChar
  brightness: number
  isHighlight: boolean
  highlightBrightness: number
}

interface LetterGridBackgroundProps {
  fillCenter?: boolean
}

export function LetterGridBackground({ fillCenter = false }: LetterGridBackgroundProps) {
  // Use ref for grid state to avoid React re-renders on every frame
  const gridRef = useRef<Cell[][]>([])
  const [renderKey, setRenderKey] = useState(0)
  const initializedRef = useRef(false)

  // Initialize grid once
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

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
    gridRef.current = initialGrid
    setRenderKey(1) // Trigger initial render
  }, [])

  // Animation loop - updates ref directly, triggers render periodically
  useEffect(() => {
    if (gridRef.current.length === 0) return

    const updateGrid = () => {
      const grid = gridRef.current

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const cell = grid[row][col]

          // Progress morph animation (smooth transitions)
          if (cell.morphProgress > 0 && cell.morphProgress < 1) {
            cell.morphProgress = Math.min(1, cell.morphProgress + 0.15)
            if (cell.morphProgress >= 1) {
              cell.char = cell.nextChar
              cell.morphProgress = 0
            }
          }

          // Start new morph - only ~5% of letters change per frame for smoother performance
          if (cell.morphProgress === 0 && !cell.isHighlight && Math.random() < 0.05) {
            cell.nextChar = CHARS[Math.floor(Math.random() * CHARS.length)]
            cell.morphProgress = 0.01
          }

          // Gentle brightness drift
          if (!cell.isHighlight) {
            const drift = (Math.random() - 0.5) * 0.08
            cell.brightness = Math.max(0.2, Math.min(0.8, cell.brightness + drift))
          }

          // Smooth highlight fade (hold longer so words are readable)
          if (cell.isHighlight) {
            cell.highlightBrightness = Math.min(1, cell.highlightBrightness + 0.2)
          } else if (cell.highlightBrightness > 0) {
            cell.highlightBrightness = Math.max(0, cell.highlightBrightness - 0.04) // Slower fade
          }
        }
      }

      // Insert word - spawn occasionally
      if (Math.random() < 0.04) {
        // Spawn 1 word at a time for cleaner look
        const numWords = 1
        for (let w = 0; w < numWords; w++) {
          const word = HIGHLIGHT_WORDS[Math.floor(Math.random() * HIGHLIGHT_WORDS.length)]
          const isHorizontal = Math.random() > 0.5

          if (isHorizontal) {
            const row = Math.floor(Math.random() * ROWS)
            const startCol = Math.floor(Math.random() * (COLS - word.length))
            for (let i = 0; i < word.length; i++) {
              grid[row][startCol + i].char = word[i]
              grid[row][startCol + i].nextChar = word[i]
              grid[row][startCol + i].morphProgress = 0
              grid[row][startCol + i].isHighlight = true
            }
          } else {
            const col = Math.floor(Math.random() * COLS)
            const startRow = Math.floor(Math.random() * (ROWS - word.length))
            for (let i = 0; i < word.length; i++) {
              grid[startRow + i][col].char = word[i]
              grid[startRow + i][col].nextChar = word[i]
              grid[startRow + i][col].morphProgress = 0
              grid[startRow + i][col].isHighlight = true
            }
          }
        }
      }

      // Random letter sparks - instant flash then gone (reduced frequency)
      if (Math.random() < 0.1) {
        const numSparks = 1 + Math.floor(Math.random() * 3)
        for (let s = 0; s < numSparks; s++) {
          const row = Math.floor(Math.random() * ROWS)
          const col = Math.floor(Math.random() * COLS)
          if (!grid[row][col].isHighlight) {
            // Don't set isHighlight - just flash brightness directly so it fades immediately
            grid[row][col].highlightBrightness = 0.5 + Math.random() * 0.5
          }
        }
      }

      // Clear old highlights (hold longer so words are readable, then fade)
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          if (grid[row][col].isHighlight && grid[row][col].highlightBrightness >= 0.95) {
            if (Math.random() < 0.025) { // Lower probability = words stay longer
              grid[row][col].isHighlight = false
            }
          }
        }
      }

      // Trigger re-render
      setRenderKey(k => k + 1)
    }

    // Slower interval for smoother interactions (100ms = 10fps)
    const interval = setInterval(updateGrid, 100)

    return () => clearInterval(interval)
  }, [])

  const grid = gridRef.current
  if (grid.length === 0) return null

  const gridStyle: React.CSSProperties = {
    ...styles.grid,
    ...(fillCenter ? {} : {
      maskImage: `radial-gradient(circle at 50% 50%, transparent 0%, transparent 16%, rgba(0,0,0,1) 22%, rgba(0,0,0,1) 100%)`,
      WebkitMaskImage: `radial-gradient(circle at 50% 50%, transparent 0%, transparent 16%, rgba(0,0,0,1) 22%, rgba(0,0,0,1) 100%)`,
    }),
  }

  return (
    <div style={styles.container}>
      <style>{cssStyles}</style>
      <div style={gridStyle}>
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
    contain: "strict", // Layout isolation for performance
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
    fontFamily: "var(--font-family-mono)",
    fontSize: "clamp(8px, 1vw, 12px)",
    fontWeight: 500,
    textAlign: "center",
    lineHeight: 1,
  },
}
