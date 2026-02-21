"use client"

import { useState, useEffect, useRef } from "react"
import { colors } from "@/lib/colors"
import { transitions } from "@/lib/animations"

interface ImageStampToolProps {
  handle: string
  onClose: () => void
}

export default function ImageStampTool({ handle, onClose }: ImageStampToolProps) {
  const [image, setImage] = useState<string | null>(null)
  const [stampedImage, setStampedImage] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle")
  const [dragOver, setDragOver] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const tipUrl = `tipz.cash/${handle}`

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile()
          if (file) {
            const reader = new FileReader()
            reader.onload = (ev) => {
              setImage(ev.target?.result as string)
              setStampedImage(null)
            }
            reader.readAsDataURL(file)
          }
          break
        }
      }
    }

    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [])

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImage(ev.target?.result as string)
        setStampedImage(null)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImage(ev.target?.result as string)
        setStampedImage(null)
      }
      reader.readAsDataURL(file)
    }
  }

  // Stamp the image with watermark
  useEffect(() => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      // Scale stamp based on image area (geometric mean handles banners well)
      const effectiveSize = Math.sqrt(img.width * img.height)
      const fontSize = Math.max(12, Math.min(28, effectiveSize * 0.018))
      const margin = fontSize * 1.2

      ctx.font = `600 ${fontSize}px "JetBrains Mono", "SF Mono", monospace`
      const textWidth = ctx.measureText(tipUrl).width

      // Position: bottom-right corner
      const textX = img.width - textWidth - margin
      const textY = img.height - margin

      // Sample background brightness in the stamp region
      const sampleX = Math.max(0, Math.floor(textX - 4))
      const sampleY = Math.max(0, Math.floor(textY - fontSize - 4))
      const sampleW = Math.min(Math.floor(textWidth + 8), img.width - sampleX)
      const sampleH = Math.min(Math.floor(fontSize + 8), img.height - sampleY)
      const pixels = ctx.getImageData(sampleX, sampleY, sampleW, sampleH).data
      let totalLuminance = 0
      const pixelCount = pixels.length / 4
      for (let i = 0; i < pixels.length; i += 4) {
        totalLuminance += (pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114)
      }
      const avgLuminance = totalLuminance / pixelCount // 0-255

      // Pick colors based on background: dark bg → orange+white, light bg → dark orange+dark
      const isLight = avgLuminance > 140
      const tipzColor = isLight ? "#C47B0A" : "#F5A623"
      const cashColor = isLight ? "#1a1a1a" : "#FFFFFF"
      const shadowColor = isLight ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.7)"

      ctx.textBaseline = "alphabetic"

      // Subtle shadow for readability
      ctx.shadowColor = shadowColor
      ctx.shadowBlur = fontSize * 0.3
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // "tipz" in orange
      ctx.fillStyle = tipzColor
      ctx.fillText("tipz", textX, textY)
      const tipzWidth = ctx.measureText("tipz").width

      // ".cash/{handle}" in white/dark
      ctx.fillStyle = cashColor
      ctx.fillText(`.cash/${handle}`, textX + tipzWidth, textY)

      // Reset shadow
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0

      setStampedImage(canvas.toDataURL("image/png"))
    }
    img.src = image
  }, [image, tipUrl])

  // Copy stamped image to clipboard
  const handleCopy = async () => {
    if (!stampedImage || !canvasRef.current) return

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvasRef.current!.toBlob((b) => {
          if (b) resolve(b)
          else reject(new Error("Failed to create blob"))
        }, "image/png")
      })

      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
      setStatus("copied")
      setTimeout(() => setStatus("idle"), 2000)
    } catch {
      // Fallback: download instead
      handleDownload()
      setStatus("copied")
      setTimeout(() => setStatus("idle"), 2000)
    }
  }

  // Download stamped image
  const handleDownload = () => {
    if (!stampedImage) return
    const a = document.createElement("a")
    a.href = stampedImage
    a.download = `tipz-${handle}-stamped.png`
    a.click()
  }

  // Clear state
  const handleClear = () => {
    setImage(null)
    setStampedImage(null)
    setStatus("idle")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div style={{ animation: "fadeInUp 0.2s ease-out" }}>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {!image ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            padding: "24px",
            background: dragOver ? colors.primaryGlow : "transparent",
            border: `1px dashed ${dragOver ? colors.primary : colors.border}`,
            borderRadius: "8px",
            textAlign: "center",
            cursor: "pointer",
            transition: transitions.fast,
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.primary}
            strokeWidth="1.5"
            style={{ margin: "0 auto 10px", display: "block" }}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
          <div style={{
            fontSize: "13px",
            fontWeight: 500,
            color: colors.primary,
            fontFamily: "var(--font-family)",
            marginBottom: "4px",
          }}>
            Drop, Paste, or Click to Upload
          </div>
          <div style={{
            fontSize: "11px",
            color: colors.muted,
            fontFamily: "var(--font-family)",
          }}>
            Ctrl+V to paste from clipboard
          </div>
        </div>
      ) : (
        <>
          <div style={{
            position: "relative",
            marginBottom: "10px",
            borderRadius: "8px",
            overflow: "hidden",
            border: `1px solid ${colors.border}`,
          }}>
            {stampedImage && (
              <img
                src={stampedImage}
                alt="Stamped preview"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            )}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleCopy}
              disabled={!stampedImage}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "12px",
                fontSize: "13px",
                fontWeight: 600,
                color: colors.bg,
                background: status === "copied" ? colors.success : colors.primary,
                border: "none",
                borderRadius: "8px",
                cursor: stampedImage ? "pointer" : "default",
                fontFamily: "var(--font-family-mono)",
                transition: transitions.fast,
              }}
            >
              {status === "copied" ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                  Copy Stamped Image
                </>
              )}
            </button>
            <button
              onClick={handleClear}
              style={{
                padding: "12px",
                fontSize: "13px",
                color: colors.muted,
                background: "transparent",
                border: `1px solid ${colors.border}`,
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily: "var(--font-family-mono)",
                transition: transitions.fast,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.error
                e.currentTarget.style.color = colors.error
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border
                e.currentTarget.style.color = colors.muted
              }}
            >
              Clear
            </button>
          </div>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  )
}
