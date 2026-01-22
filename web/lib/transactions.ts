/**
 * Transaction Logging Module for TIPZ
 *
 * This module provides functions for logging and managing tip transactions
 * using Supabase as the backend. It handles the full lifecycle of Zcash
 * shielded transactions from creation to confirmation.
 *
 * Database Schema:
 *
 * Table: transactions
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ Column               │ Type        │ Description                │
 * ├──────────────────────┼─────────────┼────────────────────────────┤
 * │ id                   │ uuid        │ Primary key (auto-gen)     │
 * │ creator_id           │ uuid        │ FK to creators.id          │
 * │ sender_address       │ text        │ Sender's shielded address  │
 * │ recipient_address    │ text        │ Creator's shielded address │
 * │ amount_zec           │ decimal     │ Amount in ZEC              │
 * │ amount_usd           │ decimal     │ USD value at time of tx    │
 * │ tx_hash              │ text        │ Zcash transaction hash     │
 * │ status               │ enum        │ pending/confirmed/failed   │
 * │ confirmations        │ integer     │ Number of confirmations    │
 * │ memo                 │ text        │ Optional encrypted memo    │
 * │ source_platform      │ text        │ x, substack, extension     │
 * │ source_url           │ text        │ URL where tip initiated    │
 * │ created_at           │ timestamptz │ When transaction logged    │
 * │ confirmed_at         │ timestamptz │ When confirmed on chain    │
 * │ metadata             │ jsonb       │ Additional metadata        │
 * └──────────────────────┴─────────────┴────────────────────────────┘
 *
 * Indexes:
 * - idx_transactions_creator_id ON transactions(creator_id)
 * - idx_transactions_tx_hash ON transactions(tx_hash) UNIQUE
 * - idx_transactions_status ON transactions(status)
 * - idx_transactions_created_at ON transactions(created_at DESC)
 *
 * SQL Migration (for future use):
 *
 * ```sql
 * CREATE TYPE transaction_status AS ENUM ('pending', 'confirmed', 'failed');
 *
 * CREATE TABLE transactions (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   creator_id UUID REFERENCES creators(id) ON DELETE SET NULL,
 *   sender_address TEXT,
 *   recipient_address TEXT NOT NULL,
 *   amount_zec DECIMAL(18, 8) NOT NULL,
 *   amount_usd DECIMAL(10, 2),
 *   tx_hash TEXT UNIQUE,
 *   status transaction_status NOT NULL DEFAULT 'pending',
 *   confirmations INTEGER DEFAULT 0,
 *   memo TEXT,
 *   source_platform TEXT,
 *   source_url TEXT,
 *   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *   confirmed_at TIMESTAMPTZ,
 *   metadata JSONB DEFAULT '{}'::jsonb
 * );
 *
 * CREATE INDEX idx_transactions_creator_id ON transactions(creator_id);
 * CREATE INDEX idx_transactions_tx_hash ON transactions(tx_hash);
 * CREATE INDEX idx_transactions_status ON transactions(status);
 * CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
 *
 * -- RLS Policies
 * ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
 *
 * -- Policy: Creators can view their own transactions
 * CREATE POLICY "Creators can view own transactions"
 *   ON transactions FOR SELECT
 *   USING (creator_id = auth.uid());
 *
 * -- Policy: Service role can insert/update
 * CREATE POLICY "Service can manage transactions"
 *   ON transactions FOR ALL
 *   USING (auth.role() = 'service_role');
 * ```
 */

import { supabase } from "./supabase"

/**
 * Database row type for transactions table.
 * Maps to the actual column names in Supabase.
 */
interface TransactionRow {
  id: string
  creator_id: string | null
  sender_address: string | null
  recipient_address: string
  amount_zec: number
  amount_usd: number | null
  tx_hash: string | null
  status: TransactionStatus
  confirmations: number
  memo: string | null
  source_platform: string
  source_url: string | null
  created_at: string
  confirmed_at: string | null
  metadata: TransactionMetadata | null
}

/**
 * Map database row to Transaction interface.
 * Converts snake_case columns to camelCase properties.
 */
function mapDbToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    creatorId: row.creator_id || "",
    senderAddress: row.sender_address || undefined,
    recipientAddress: row.recipient_address,
    amountZec: Number(row.amount_zec),
    amountUsd: row.amount_usd ? Number(row.amount_usd) : undefined,
    txHash: row.tx_hash || undefined,
    status: row.status,
    confirmations: row.confirmations || 0,
    memo: row.memo || undefined,
    sourcePlatform: row.source_platform as TransactionSource,
    sourceUrl: row.source_url || undefined,
    createdAt: new Date(row.created_at),
    confirmedAt: row.confirmed_at ? new Date(row.confirmed_at) : undefined,
    metadata: row.metadata || undefined
  }
}

/**
 * Transaction status enum.
 * Tracks the lifecycle of a tip transaction.
 */
export type TransactionStatus = "pending" | "confirmed" | "failed"

/**
 * Source platform for transaction.
 * Where the tip was initiated from.
 */
export type TransactionSource = "x" | "substack" | "extension" | "api" | "web"

/**
 * Core transaction interface.
 * Represents a single tip transaction.
 */
export interface Transaction {
  /** Unique transaction ID (UUID) */
  id: string

  /** Reference to the creator receiving the tip */
  creatorId: string

  /**
   * Sender's shielded address (optional)
   * May be null for truly anonymous tips
   */
  senderAddress?: string

  /** Recipient's (creator's) shielded address */
  recipientAddress: string

  /** Amount in ZEC (Zcash) */
  amountZec: number

  /**
   * USD value at time of transaction
   * Captured for analytics and reporting
   */
  amountUsd?: number

  /**
   * Zcash transaction hash
   * Set when transaction is broadcast to network
   */
  txHash?: string

  /** Current transaction status */
  status: TransactionStatus

  /** Number of blockchain confirmations */
  confirmations: number

  /**
   * Encrypted memo field
   * Zcash shielded transactions support 512-byte memos
   */
  memo?: string

  /** Platform where tip was initiated */
  sourcePlatform: TransactionSource

  /** URL of the content being tipped (if applicable) */
  sourceUrl?: string

  /** When the transaction was created/logged */
  createdAt: Date

  /** When the transaction was confirmed on-chain */
  confirmedAt?: Date

  /** Additional metadata (JSON) */
  metadata?: TransactionMetadata
}

/**
 * Additional transaction metadata.
 * Stored as JSONB for flexibility.
 */
export interface TransactionMetadata {
  /** Client IP (hashed for privacy) */
  clientIpHash?: string

  /** Browser extension version */
  extensionVersion?: string

  /** Exchange rate used for USD conversion */
  exchangeRate?: number

  /** Raw transaction data (for debugging) */
  rawTx?: string

  /** Any error messages if transaction failed */
  errorMessage?: string

  /** Number of retry attempts */
  retryCount?: number

  /** Custom fields */
  [key: string]: unknown
}

/**
 * Input for creating a new transaction log entry.
 * Used by logTransaction function.
 */
export interface CreateTransactionInput {
  creatorId: string
  senderAddress?: string
  recipientAddress: string
  amountZec: number
  amountUsd?: number
  txHash?: string
  memo?: string
  sourcePlatform: TransactionSource
  sourceUrl?: string
  metadata?: TransactionMetadata
}

/**
 * Input for updating transaction status.
 * Used by updateTransactionStatus function.
 */
export interface UpdateTransactionInput {
  txHash?: string
  status: TransactionStatus
  confirmations?: number
  confirmedAt?: Date
  metadata?: Partial<TransactionMetadata>
}

/**
 * Query filters for fetching transactions.
 */
export interface TransactionQuery {
  creatorId?: string
  status?: TransactionStatus
  sourcePlatform?: TransactionSource
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

/**
 * Aggregated transaction statistics for a creator.
 */
export interface TransactionStats {
  /** Creator ID */
  creatorId: string

  /** Total tips received (all time) */
  totalTips: number

  /** Total ZEC received */
  totalZec: number

  /** Total USD value (at time of each transaction) */
  totalUsd: number

  /** Tips in the last 24 hours */
  tips24h: number

  /** Tips in the last 7 days */
  tips7d: number

  /** Tips in the last 30 days */
  tips30d: number

  /** Average tip size in ZEC */
  averageTipZec: number

  /** Largest single tip in ZEC */
  largestTipZec: number
}

/**
 * Log a new tip transaction.
 *
 * This is the primary entry point for recording tips.
 * Should be called when a tip transaction is initiated.
 *
 * @param input - Transaction details
 * @returns The created transaction record
 * @throws Error if database insert fails
 *
 * @example
 * ```typescript
 * const tx = await logTransaction({
 *   creatorId: "550e8400-e29b-41d4-a716-446655440000",
 *   recipientAddress: "zs1...",
 *   amountZec: 0.01,
 *   sourcePlatform: "extension",
 *   sourceUrl: "https://x.com/creator/status/123"
 * })
 * ```
 */
export async function logTransaction(
  input: CreateTransactionInput
): Promise<Transaction> {
  // Validate required fields
  if (!input.recipientAddress) {
    throw new Error("recipientAddress is required")
  }
  if (typeof input.amountZec !== "number" || input.amountZec <= 0) {
    throw new Error("amountZec must be a positive number")
  }
  if (!input.sourcePlatform) {
    throw new Error("sourcePlatform is required")
  }

  // Handle duplicate txHash gracefully by checking first
  if (input.txHash) {
    const existing = await getTransactionByHash(input.txHash)
    if (existing) {
      return existing
    }
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      creator_id: input.creatorId,
      sender_address: input.senderAddress || null,
      recipient_address: input.recipientAddress,
      amount_zec: input.amountZec,
      amount_usd: input.amountUsd || null,
      tx_hash: input.txHash || null,
      memo: input.memo || null,
      source_platform: input.sourcePlatform,
      source_url: input.sourceUrl || null,
      metadata: input.metadata || {},
      status: "pending"
    })
    .select()
    .single()

  if (error) {
    console.error("[transactions] Insert error:", error)
    throw new Error(`Failed to log transaction: ${error.message}`)
  }

  return mapDbToTransaction(data)
}

/**
 * Update transaction status.
 *
 * Called when transaction status changes (e.g., confirmed on chain).
 *
 * @param transactionId - The transaction ID to update
 * @param update - Fields to update
 * @returns Updated transaction record or null if not found
 * @throws Error if database update fails
 */
export async function updateTransactionStatus(
  transactionId: string,
  update: UpdateTransactionInput
): Promise<Transaction | null> {
  // Build the update object
  const updateData: Record<string, unknown> = {
    status: update.status
  }

  if (update.txHash !== undefined) {
    updateData.tx_hash = update.txHash
  }

  if (update.confirmations !== undefined) {
    updateData.confirmations = update.confirmations
  }

  // Auto-set confirmed_at when status changes to confirmed
  if (update.status === "confirmed") {
    updateData.confirmed_at = update.confirmedAt?.toISOString() || new Date().toISOString()
  }

  // Merge metadata if provided
  if (update.metadata) {
    // Fetch existing metadata first to merge
    const { data: existing } = await supabase
      .from("transactions")
      .select("metadata")
      .eq("id", transactionId)
      .single()

    const existingMetadata = (existing?.metadata as TransactionMetadata) || {}
    updateData.metadata = { ...existingMetadata, ...update.metadata }
  }

  const { data, error } = await supabase
    .from("transactions")
    .update(updateData)
    .eq("id", transactionId)
    .select()
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      // Row not found
      return null
    }
    console.error("[transactions] Update error:", error)
    throw new Error(`Failed to update transaction: ${error.message}`)
  }

  return mapDbToTransaction(data)
}

/**
 * Get transactions with optional filters.
 *
 * Fetches transaction history with filtering and pagination support.
 *
 * @param query - Query filters
 * @returns Array of transactions
 * @throws Error if database query fails
 */
export async function getTransactions(
  query: TransactionQuery
): Promise<Transaction[]> {
  let queryBuilder = supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })

  // Apply filters
  if (query.creatorId) {
    queryBuilder = queryBuilder.eq("creator_id", query.creatorId)
  }

  if (query.status) {
    queryBuilder = queryBuilder.eq("status", query.status)
  }

  if (query.sourcePlatform) {
    queryBuilder = queryBuilder.eq("source_platform", query.sourcePlatform)
  }

  if (query.startDate) {
    queryBuilder = queryBuilder.gte("created_at", query.startDate.toISOString())
  }

  if (query.endDate) {
    queryBuilder = queryBuilder.lte("created_at", query.endDate.toISOString())
  }

  // Apply pagination
  const limit = query.limit || 50
  const offset = query.offset || 0
  queryBuilder = queryBuilder.range(offset, offset + limit - 1)

  const { data, error } = await queryBuilder

  if (error) {
    console.error("[transactions] Query error:", error)
    throw new Error(`Failed to fetch transactions: ${error.message}`)
  }

  return (data || []).map(mapDbToTransaction)
}

/**
 * Get transaction by ID.
 *
 * Lookup a specific transaction by its database ID.
 *
 * @param transactionId - Transaction UUID
 * @returns Transaction or null if not found
 */
export async function getTransactionById(
  transactionId: string
): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", transactionId)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    console.error("[transactions] Lookup error:", error)
    return null
  }

  return mapDbToTransaction(data)
}

/**
 * Get transaction by hash.
 *
 * Lookup a specific transaction by its blockchain hash.
 *
 * @param txHash - Zcash transaction hash
 * @returns Transaction or null if not found
 */
export async function getTransactionByHash(
  txHash: string
): Promise<Transaction | null> {
  if (!txHash || !isValidTxHash(txHash)) {
    return null
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("tx_hash", txHash)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      // Row not found
      return null
    }
    console.error("[transactions] Lookup error:", error)
    return null
  }

  return mapDbToTransaction(data)
}

/**
 * Get aggregated statistics for a creator.
 *
 * Calculates tip statistics for analytics/dashboard.
 * Only counts confirmed transactions.
 *
 * @param creatorId - The creator's ID
 * @returns Aggregated statistics
 */
export async function getCreatorStats(
  creatorId: string
): Promise<TransactionStats> {
  const now = new Date()
  const day24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const day7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const day30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Fetch all confirmed transactions for this creator
  const { data, error } = await supabase
    .from("transactions")
    .select("amount_zec, amount_usd, created_at")
    .eq("creator_id", creatorId)
    .eq("status", "confirmed")

  if (error) {
    console.error("[transactions] Stats error:", error)
    // Return empty stats on error
    return {
      creatorId,
      totalTips: 0,
      totalZec: 0,
      totalUsd: 0,
      tips24h: 0,
      tips7d: 0,
      tips30d: 0,
      averageTipZec: 0,
      largestTipZec: 0
    }
  }

  const transactions = data || []

  // Calculate aggregate stats
  let totalZec = 0
  let totalUsd = 0
  let largestTipZec = 0
  let tips24h = 0
  let tips7d = 0
  let tips30d = 0

  for (const tx of transactions) {
    const amountZec = Number(tx.amount_zec)
    const amountUsd = tx.amount_usd ? Number(tx.amount_usd) : 0
    const createdAt = new Date(tx.created_at)

    totalZec += amountZec
    totalUsd += amountUsd

    if (amountZec > largestTipZec) {
      largestTipZec = amountZec
    }

    if (createdAt >= day24h) {
      tips24h++
    }
    if (createdAt >= day7d) {
      tips7d++
    }
    if (createdAt >= day30d) {
      tips30d++
    }
  }

  const totalTips = transactions.length
  const averageTipZec = totalTips > 0 ? totalZec / totalTips : 0

  return {
    creatorId,
    totalTips,
    totalZec: Math.round(totalZec * 100000000) / 100000000, // Round to 8 decimals
    totalUsd: Math.round(totalUsd * 100) / 100, // Round to 2 decimals
    tips24h,
    tips7d,
    tips30d,
    averageTipZec: Math.round(averageTipZec * 100000000) / 100000000,
    largestTipZec: Math.round(largestTipZec * 100000000) / 100000000
  }
}

/**
 * Validate a Zcash transaction hash format.
 *
 * @param txHash - Transaction hash to validate
 * @returns True if valid format
 */
export function isValidTxHash(txHash: string): boolean {
  // Zcash transaction hashes are 64 hex characters
  return /^[a-fA-F0-9]{64}$/.test(txHash)
}

/**
 * Format ZEC amount for display.
 *
 * @param amountZec - Amount in ZEC
 * @param decimals - Number of decimal places (default 8)
 * @returns Formatted string
 */
export function formatZec(amountZec: number, decimals = 8): string {
  return amountZec.toFixed(decimals).replace(/\.?0+$/, "")
}

/**
 * Calculate USD value from ZEC amount.
 *
 * @param amountZec - Amount in ZEC
 * @param exchangeRate - Current ZEC/USD rate
 * @returns USD value
 *
 * TODO: Integrate with price API (CoinGecko, etc.)
 */
export function calculateUsdValue(
  amountZec: number,
  exchangeRate: number
): number {
  return Math.round(amountZec * exchangeRate * 100) / 100
}
