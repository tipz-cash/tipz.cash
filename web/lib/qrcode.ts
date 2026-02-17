/**
 * QR Code generation utility for TIPZ
 * Used for ZEC direct send flow and extension watermarking
 */

import QRCode from "qrcode"

export interface QRCodeOptions {
  width?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
  errorCorrectionLevel?: "L" | "M" | "Q" | "H"
}

const defaultOptions: QRCodeOptions = {
  width: 256,
  margin: 2,
  color: {
    dark: "#000000",
    light: "#FFFFFF",
  },
  errorCorrectionLevel: "M",
}

/**
 * Generate QR code as data URL (for img src)
 */
export async function generateQRDataUrl(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const mergedOptions = { ...defaultOptions, ...options }

  try {
    const dataUrl = await QRCode.toDataURL(data, {
      width: mergedOptions.width,
      margin: mergedOptions.margin,
      color: mergedOptions.color,
      errorCorrectionLevel: mergedOptions.errorCorrectionLevel,
    })
    return dataUrl
  } catch (error) {
    console.error("[qrcode] Failed to generate QR code:", error)
    throw new Error("Failed to generate QR code")
  }
}

/**
 * Generate QR code as Canvas element
 */
export async function generateQRCanvas(
  data: string,
  canvas: HTMLCanvasElement,
  options: QRCodeOptions = {}
): Promise<void> {
  const mergedOptions = { ...defaultOptions, ...options }

  try {
    await QRCode.toCanvas(canvas, data, {
      width: mergedOptions.width,
      margin: mergedOptions.margin,
      color: mergedOptions.color,
      errorCorrectionLevel: mergedOptions.errorCorrectionLevel,
    })
  } catch (error) {
    console.error("[qrcode] Failed to generate QR code:", error)
    throw new Error("Failed to generate QR code")
  }
}

/**
 * Generate QR code as SVG string
 */
export async function generateQRSvg(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const mergedOptions = { ...defaultOptions, ...options }

  try {
    const svg = await QRCode.toString(data, {
      type: "svg",
      width: mergedOptions.width,
      margin: mergedOptions.margin,
      color: mergedOptions.color,
      errorCorrectionLevel: mergedOptions.errorCorrectionLevel,
    })
    return svg
  } catch (error) {
    console.error("[qrcode] Failed to generate QR code:", error)
    throw new Error("Failed to generate QR code")
  }
}

/**
 * Encode UTF-8 text as base64url without padding (ZIP-321 memo format)
 */
function textToBase64url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  const binary = String.fromCharCode(...bytes)
  const base64 = btoa(binary)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Generate a Zcash payment URI
 * Format: zcash:<address>?amount=<amount>&memo=<memo>
 */
export function createZcashUri(
  address: string,
  amount?: number,
  memo?: string
): string {
  let uri = `zcash:${address}`
  const params: string[] = []

  if (amount && amount > 0) {
    params.push(`amount=${amount.toFixed(8)}`)
  }

  if (memo) {
    // URI encode the memo
    params.push(`memo=${textToBase64url(memo)}`)
  }

  if (params.length > 0) {
    uri += "?" + params.join("&")
  }

  return uri
}

/**
 * Generate QR code for a Zcash shielded address
 * Includes the zcash: URI prefix for wallet scanning
 */
export async function generateZecQR(
  address: string,
  amount?: number,
  memo?: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const uri = createZcashUri(address, amount, memo)
  return generateQRDataUrl(uri, options)
}
