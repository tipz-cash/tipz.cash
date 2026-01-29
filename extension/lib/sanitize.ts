/**
 * Message Content Sanitization
 *
 * Protects against XSS and other injection attacks from
 * malicious content in decrypted messages.
 */

/**
 * Sanitize message text for safe rendering
 *
 * 1. Limits length to 300 chars (280 enforced on input, but verify)
 * 2. Escapes HTML entities to prevent XSS
 * 3. Removes control characters
 */
export function sanitizeMessage(text: string): string {
  // 1. Limit length
  const truncated = text.slice(0, 300)

  // 2. Escape HTML entities
  const escaped = truncated
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

  // 3. Remove control characters (except newline, tab)
  const cleaned = escaped.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  return cleaned
}

/**
 * Truncate text to a max length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength - 3) + '...'
}
