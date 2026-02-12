/**
 * Tipz module — types and helpers for the `tipz` table.
 *
 * The `data` column stores a JSON-stringified `TipzData` object,
 * encrypted with the creator's RSA public key (see message-encryption.ts).
 */

export interface TipzData {
  amount_zec: number
  amount_usd: number
  memo?: string
}
