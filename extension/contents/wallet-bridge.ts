/**
 * Wallet Bridge - Runs in MAIN world to access window.ethereum
 * Communicates with content scripts via custom events
 */

import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://x.com/*", "https://twitter.com/*"],
  world: "MAIN",
  run_at: "document_start"
}

interface WalletRequest {
  id: string
  method: string
  params?: any
}

interface WalletResponse {
  id: string
  success: boolean
  result?: any
  error?: string
}

// Listen for wallet requests from content script
window.addEventListener("tipz-wallet-request", async (event: CustomEvent<WalletRequest>) => {
  const { id, method, params } = event.detail

  let response: WalletResponse = { id, success: false }

  try {
    const ethereum = (window as any).ethereum

    switch (method) {
      case "check":
        response = {
          id,
          success: true,
          result: {
            available: !!ethereum,
            isMetaMask: ethereum?.isMetaMask || false,
            isRabby: ethereum?.isRabby || false,
          }
        }
        break

      case "connect":
        if (!ethereum) {
          throw new Error("No wallet found. Please install MetaMask or Rabby.")
        }
        const accounts = await ethereum.request({ method: "eth_requestAccounts" })
        const chainIdHex = await ethereum.request({ method: "eth_chainId" })
        response = {
          id,
          success: true,
          result: {
            accounts,
            chainId: parseInt(chainIdHex, 16)
          }
        }
        break

      case "forceConnect":
        console.log("TIPZ BRIDGE: forceConnect called")
        if (!ethereum) {
          throw new Error("No wallet found. Please install MetaMask or Rabby.")
        }
        // First, try to revoke existing permissions to force a fresh connection
        try {
          console.log("TIPZ BRIDGE: Revoking existing permissions...")
          await ethereum.request({
            method: "wallet_revokePermissions",
            params: [{ eth_accounts: {} }]
          })
          console.log("TIPZ BRIDGE: Permissions revoked")
        } catch (revokeErr) {
          // wallet_revokePermissions might not be supported by all wallets
          console.log("TIPZ BRIDGE: Revoke not supported or failed, continuing...", revokeErr)
        }
        // Now request fresh permissions - this should show account picker
        console.log("TIPZ BRIDGE: Requesting fresh permissions...")
        const permissionsResult = await ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }]
        })
        console.log("TIPZ BRIDGE: wallet_requestPermissions result:", permissionsResult)
        // Now get the newly selected accounts
        const newAccounts = await ethereum.request({ method: "eth_requestAccounts" })
        console.log("TIPZ BRIDGE: New accounts after forceConnect:", newAccounts)
        const newChainIdHex = await ethereum.request({ method: "eth_chainId" })
        response = {
          id,
          success: true,
          result: {
            accounts: newAccounts,
            chainId: parseInt(newChainIdHex, 16)
          }
        }
        break

      case "getBalance":
        if (!ethereum) throw new Error("No wallet")
        const balance = await ethereum.request({
          method: "eth_getBalance",
          params: [params.address, "latest"]
        })
        response = { id, success: true, result: balance }
        break

      case "getAccounts":
        // Get accounts without prompting (returns empty if not connected)
        if (!ethereum) throw new Error("No wallet")
        const existingAccounts = await ethereum.request({ method: "eth_accounts" })
        response = { id, success: true, result: existingAccounts }
        break

      case "getChainId":
        if (!ethereum) throw new Error("No wallet")
        const currentChainId = await ethereum.request({ method: "eth_chainId" })
        response = { id, success: true, result: currentChainId }
        break

      case "sendTransaction":
        if (!ethereum) throw new Error("No wallet")
        const txHash = await ethereum.request({
          method: "eth_sendTransaction",
          params: [params.tx]
        })
        response = { id, success: true, result: txHash }
        break

      case "switchChain":
        if (!ethereum) throw new Error("No wallet")
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${params.chainId.toString(16)}` }]
        })
        response = { id, success: true }
        break

      default:
        throw new Error(`Unknown method: ${method}`)
    }
  } catch (err: any) {
    response = {
      id,
      success: false,
      error: err.message || "Unknown error"
    }
  }

  // Send response back to content script
  window.dispatchEvent(new CustomEvent("tipz-wallet-response", { detail: response }))
})

// Notify that bridge is ready
window.dispatchEvent(new CustomEvent("tipz-wallet-bridge-ready"))

console.log("TIPZ: Wallet bridge loaded in main world")
