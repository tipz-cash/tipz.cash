import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  mapTokenToAssetId,
  mapAddressToAssetId,
  toSmallestUnits,
  fromSmallestUnits,
  isSwapComplete,
  isSwapSuccessful,
  getStatusMessage,
  ASSET_IDS,
  ZEC_ASSET_ID,
} from "@/lib/near-intents"

// ============================================================================
// Asset ID Mapping
// ============================================================================

describe("mapTokenToAssetId", () => {
  it("maps ETH on mainnet", () => {
    expect(mapTokenToAssetId("ETH", 1)).toBe("nep141:eth.omft.near")
  })

  it("maps ETH on Arbitrum", () => {
    expect(mapTokenToAssetId("ETH", 42161)).toBe("nep141:arb.omft.near")
  })

  it("maps ETH on Optimism", () => {
    expect(mapTokenToAssetId("ETH", 10)).toBe(
      "nep245:v2_1.omni.hot.tg:10_11111111111111111111"
    )
  })

  it("maps USDC on all chains", () => {
    expect(mapTokenToAssetId("USDC", 1)).toBe(
      "nep141:eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near"
    )
    expect(mapTokenToAssetId("USDC", 42161)).toBe(
      "nep141:arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near"
    )
    expect(mapTokenToAssetId("USDC", 137)).toBe(
      "nep245:v2_1.omni.hot.tg:137_qiStmoQJDQPTebaPjgx5VBxZv6L"
    )
  })

  it("maps SOL on Solana", () => {
    expect(mapTokenToAssetId("SOL", 501)).toBe("nep141:sol.omft.near")
  })

  it("maps ZEC", () => {
    expect(mapTokenToAssetId("ZEC", 0)).toBe(ZEC_ASSET_ID)
  })

  it("is case-insensitive", () => {
    expect(mapTokenToAssetId("eth", 1)).toBe(mapTokenToAssetId("ETH", 1))
    expect(mapTokenToAssetId("usdc", 137)).toBe(mapTokenToAssetId("USDC", 137))
  })

  it("returns null for unsupported token", () => {
    expect(mapTokenToAssetId("DOGE", 1)).toBeNull()
  })

  it("returns null for unsupported chain", () => {
    expect(mapTokenToAssetId("ETH", 999)).toBeNull()
  })
})

describe("mapAddressToAssetId", () => {
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

  it("maps native ETH on mainnet", () => {
    expect(mapAddressToAssetId(ZERO_ADDRESS, 1)).toBe("nep141:eth.omft.near")
  })

  it("maps native MATIC on Polygon", () => {
    expect(mapAddressToAssetId(ZERO_ADDRESS, 137)).toBe(
      "nep245:v2_1.omni.hot.tg:137_11111111111111111111"
    )
  })

  it("maps USDC contract address on Ethereum", () => {
    expect(
      mapAddressToAssetId("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", 1)
    ).toBe("nep141:eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near")
  })

  it("maps USDT contract address on Ethereum", () => {
    expect(
      mapAddressToAssetId("0xdac17f958d2ee523a2206206994597c13d831ec7", 1)
    ).toBe("nep141:eth-0xdac17f958d2ee523a2206206994597c13d831ec7.omft.near")
  })

  it("maps SOL native", () => {
    expect(mapAddressToAssetId("native", 501)).toBe("nep141:sol.omft.near")
  })

  it("maps SOL system program address", () => {
    expect(
      mapAddressToAssetId(
        "So11111111111111111111111111111111111111112",
        501
      )
    ).toBe("nep141:sol.omft.near")
  })

  it("returns null for unknown contract address", () => {
    expect(
      mapAddressToAssetId("0x1234567890abcdef1234567890abcdef12345678", 1)
    ).toBeNull()
  })

  it("returns null for unsupported SPL token on Solana", () => {
    expect(
      mapAddressToAssetId("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", 501)
    ).toBeNull()
  })

  it("handles case-insensitive addresses", () => {
    const upper = mapAddressToAssetId(
      "0xA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48",
      1
    )
    const lower = mapAddressToAssetId(
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      1
    )
    expect(upper).toBe(lower)
  })
})

// ============================================================================
// Unit Conversion
// ============================================================================

describe("toSmallestUnits", () => {
  it("converts ETH (18 decimals)", () => {
    expect(toSmallestUnits("1", 18)).toBe("1000000000000000000")
    expect(toSmallestUnits("0.01", 18)).toBe("10000000000000000")
    expect(toSmallestUnits("0.001", 18)).toBe("1000000000000000")
  })

  it("converts USDC (6 decimals)", () => {
    expect(toSmallestUnits("1", 6)).toBe("1000000")
    expect(toSmallestUnits("10", 6)).toBe("10000000")
    expect(toSmallestUnits("0.50", 6)).toBe("500000")
  })

  it("converts ZEC (8 decimals)", () => {
    expect(toSmallestUnits("1", 8)).toBe("100000000")
    expect(toSmallestUnits("0.001", 8)).toBe("100000")
  })

  it("handles whole numbers", () => {
    expect(toSmallestUnits("100", 18)).toBe("100000000000000000000")
  })

  it("truncates excess decimal places", () => {
    // 6 decimal token, input has 8 decimals → truncate to 6
    expect(toSmallestUnits("1.12345678", 6)).toBe("1123456")
  })
})

describe("fromSmallestUnits", () => {
  it("converts wei to ETH", () => {
    expect(fromSmallestUnits("1000000000000000000", 18)).toBe("1")
    expect(fromSmallestUnits("10000000000000000", 18)).toBe("0.01")
  })

  it("converts USDC smallest units", () => {
    expect(fromSmallestUnits("1000000", 6)).toBe("1")
    expect(fromSmallestUnits("500000", 6)).toBe("0.5")
  })

  it("converts ZEC satoshis", () => {
    expect(fromSmallestUnits("100000000", 8)).toBe("1")
    expect(fromSmallestUnits("100000", 8)).toBe("0.001")
  })

  it("handles zero", () => {
    expect(fromSmallestUnits("0", 18)).toBe("0")
  })

  it("roundtrips correctly", () => {
    const original = "1.5"
    const smallest = toSmallestUnits(original, 18)
    const back = fromSmallestUnits(smallest, 18)
    expect(back).toBe("1.5")
  })
})

// ============================================================================
// Swap Status Helpers
// ============================================================================

describe("isSwapComplete", () => {
  it("returns true for terminal states", () => {
    expect(isSwapComplete("SUCCESS")).toBe(true)
    expect(isSwapComplete("REFUNDED")).toBe(true)
    expect(isSwapComplete("FAILED")).toBe(true)
  })

  it("returns false for in-progress states", () => {
    expect(isSwapComplete("PENDING_DEPOSIT")).toBe(false)
    expect(isSwapComplete("PROCESSING")).toBe(false)
    expect(isSwapComplete("EXPIRED")).toBe(false)
  })
})

describe("isSwapSuccessful", () => {
  it("returns true only for SUCCESS", () => {
    expect(isSwapSuccessful("SUCCESS")).toBe(true)
    expect(isSwapSuccessful("REFUNDED")).toBe(false)
    expect(isSwapSuccessful("FAILED")).toBe(false)
    expect(isSwapSuccessful("PROCESSING")).toBe(false)
  })
})

describe("getStatusMessage", () => {
  it("returns human-readable messages", () => {
    expect(getStatusMessage("PENDING_DEPOSIT")).toBe("Waiting for deposit...")
    expect(getStatusMessage("PROCESSING")).toBe("Processing swap...")
    expect(getStatusMessage("SUCCESS")).toBe("Swap complete!")
    expect(getStatusMessage("REFUNDED")).toBe("Swap refunded")
    expect(getStatusMessage("FAILED")).toBe("Swap failed")
    expect(getStatusMessage("EXPIRED")).toBe("Quote expired")
  })

  it("handles unknown status", () => {
    expect(getStatusMessage("UNKNOWN" as any)).toBe("Unknown status")
  })
})
