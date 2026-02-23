import { SignJWT, jwtVerify } from "jose"
import { NextRequest, NextResponse } from "next/server"

const COOKIE_NAME = "tipz_session"
const TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days

interface SessionPayload {
  handle: string
  creatorId: string | null
}

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error("SESSION_SECRET not configured")
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(
  handle: string,
  creatorId: string | null
): Promise<string> {
  return new SignJWT({ handle, creatorId: creatorId ?? "" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .sign(getSecret())
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    const handle = payload.handle as string | undefined
    const creatorId = payload.creatorId as string | undefined
    if (!handle) return null
    return { handle, creatorId: creatorId || null }
  } catch {
    return null
  }
}

export async function getSessionFromRequest(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySessionToken(token)
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TTL_SECONDS,
    path: "/",
  })
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })
}
