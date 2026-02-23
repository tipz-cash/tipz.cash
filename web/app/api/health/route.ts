import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { isNearConfigured, getNearNetwork } from "@/lib/near"
import { isTwitterApiConfigured } from "@/lib/twitter-api"

/**
 * Health check endpoint for monitoring and deployment verification.
 *
 * Checks:
 * - Service is running
 * - Database connectivity (creators table)
 * - Transactions table accessibility
 * - Environment configuration
 * - NEAR configuration (for real payments)
 * - Twitter API configuration (for tweet verification)
 *
 * Returns:
 * - 200: Service healthy
 * - 503: Service unhealthy (critical check failed)
 */

const SERVICE_VERSION = "1.3.0"
const SERVICE_NAME = "tipz-api"

// Track service start time for uptime calculation
const serviceStartTime = Date.now()

interface DatabaseCheck {
  status: "connected" | "disconnected"
  latency_ms?: number
  error?: string
}

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy"
  service: string
  version: string
  timestamp: string
  uptime_seconds: number
  checks: {
    database: DatabaseCheck
    tipz_table: DatabaseCheck
    environment: {
      status: "configured" | "misconfigured"
      missing_vars?: string[]
    }
    near: {
      status: "configured" | "not_configured"
      network?: string
      message?: string
    }
    twitter: {
      status: "configured" | "not_configured"
      message?: string
    }
  }
}

/**
 * Check if required environment variables are set.
 */
function checkEnvironment(): { configured: boolean; missing: string[] } {
  const requiredVars = ["SUPABASE_URL", "SUPABASE_SERVICE_KEY"]
  const missing: string[] = []

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  }

  return { configured: missing.length === 0, missing }
}

export async function GET() {
  const nearConfigured = isNearConfigured()
  const twitterConfigured = isTwitterApiConfigured()

  const health: HealthStatus = {
    status: "healthy",
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor((Date.now() - serviceStartTime) / 1000),
    checks: {
      database: {
        status: "disconnected",
      },
      tipz_table: {
        status: "disconnected",
      },
      environment: {
        status: "configured",
      },
      near: {
        status: nearConfigured ? "configured" : "not_configured",
        network: getNearNetwork(),
        message: nearConfigured
          ? "Production mode - real payments enabled"
          : "NEAR credentials missing",
      },
      twitter: {
        status: twitterConfigured ? "configured" : "not_configured",
        message: twitterConfigured
          ? "Tweet verification enabled"
          : "Tweet verification disabled - registrations default to pending",
      },
    },
  }

  // Check environment configuration
  const envCheck = checkEnvironment()
  if (!envCheck.configured) {
    health.status = "degraded"
    health.checks.environment = {
      status: "misconfigured",
      missing_vars: envCheck.missing,
    }
  }

  // Check database connectivity (creators table)
  if (!supabase) {
    health.checks.database = {
      status: "disconnected",
      error: "Supabase client not configured",
    }
    health.checks.tipz_table = {
      status: "disconnected",
      error: "Supabase client not configured",
    }
  } else {
    try {
      const dbStart = Date.now()

      const { error } = await supabase
        .from("creators")
        .select("id", { count: "exact", head: true })
        .limit(1)

      const dbLatency = Date.now() - dbStart

      if (error) {
        health.status = "unhealthy"
        health.checks.database = {
          status: "disconnected",
          error: error.message,
        }
      } else {
        health.checks.database = {
          status: "connected",
          latency_ms: dbLatency,
        }
      }
    } catch (error) {
      health.status = "unhealthy"
      health.checks.database = {
        status: "disconnected",
        error: error instanceof Error ? error.message : "Unknown database error",
      }
    }

    // Check tipz table accessibility
    try {
      const txStart = Date.now()

      const { error } = await supabase
        .from("tipz")
        .select("id", { count: "exact", head: true })
        .limit(1)

      const txLatency = Date.now() - txStart

      if (error) {
        // Tipz table not existing is degraded, not unhealthy
        // (it might not have been created yet via migration)
        if (health.status === "healthy") {
          health.status = "degraded"
        }
        health.checks.tipz_table = {
          status: "disconnected",
          error: error.message,
        }
      } else {
        health.checks.tipz_table = {
          status: "connected",
          latency_ms: txLatency,
        }
      }
    } catch (error) {
      if (health.status === "healthy") {
        health.status = "degraded"
      }
      health.checks.tipz_table = {
        status: "disconnected",
        error: error instanceof Error ? error.message : "Unknown database error",
      }
    }
  }

  // Determine HTTP status based on health
  let httpStatus = 200
  if (health.status === "unhealthy") {
    httpStatus = 503
  } else if (health.status === "degraded") {
    httpStatus = 200 // Still return 200 for degraded, but status field indicates issues
  }

  return NextResponse.json(health, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "X-Health-Status": health.status,
    },
  })
}
