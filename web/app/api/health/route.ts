import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

/**
 * Health check endpoint for monitoring and deployment verification.
 *
 * Checks:
 * - Service is running
 * - Database connectivity
 *
 * Returns:
 * - 200: Service healthy
 * - 503: Service unhealthy (database unreachable)
 */

const SERVICE_VERSION = "1.1.0"

interface HealthStatus {
  status: "healthy" | "unhealthy"
  version: string
  timestamp: string
  checks: {
    database: {
      status: "connected" | "disconnected"
      latency_ms?: number
      error?: string
    }
  }
}

export async function GET() {
  const startTime = Date.now()

  const health: HealthStatus = {
    status: "healthy",
    version: SERVICE_VERSION,
    timestamp: new Date().toISOString(),
    checks: {
      database: {
        status: "disconnected"
      }
    }
  }

  // Check database connectivity
  try {
    const dbStart = Date.now()

    // Simple query to verify connection - using count which is lightweight
    const { error } = await supabase
      .from("creators")
      .select("id", { count: "exact", head: true })
      .limit(1)

    const dbLatency = Date.now() - dbStart

    if (error) {
      health.status = "unhealthy"
      health.checks.database = {
        status: "disconnected",
        error: error.message
      }
    } else {
      health.checks.database = {
        status: "connected",
        latency_ms: dbLatency
      }
    }
  } catch (error) {
    health.status = "unhealthy"
    health.checks.database = {
      status: "disconnected",
      error: error instanceof Error ? error.message : "Unknown database error"
    }
  }

  const httpStatus = health.status === "healthy" ? 200 : 503

  return NextResponse.json(health, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate"
    }
  })
}
