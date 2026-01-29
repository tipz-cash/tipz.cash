"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  connectWallet as connectWalletLib,
  disconnectWallet as disconnectWalletLib,
  restoreWalletSession,
  getWalletState,
  setupWalletListeners,
  isWalletAvailable,
  detectWallet,
  switchChain as switchChainLib,
  type WalletState,
  type WalletType,
} from "@/lib/wallet"

interface UseWalletReturn {
  walletState: WalletState
  isConnecting: boolean
  isSwitchingChain: boolean
  isAvailable: boolean
  detectedWallet: WalletType | null
  error: string | null
  connect: (walletType?: WalletType) => Promise<void>
  disconnect: () => void
  switchChain: (chainId: number) => Promise<boolean>
  refreshState: () => Promise<void>
}

export function useWallet(): UseWalletReturn {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    walletType: null,
    balance: null,
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSwitchingChain, setIsSwitchingChain] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAvailable, setIsAvailable] = useState(false)
  const [detectedWallet, setDetectedWallet] = useState<WalletType | null>(null)

  // Ref to track chain switching state for event listeners (avoids stale closure)
  const isSwitchingChainRef = useRef(false)

  // Check wallet availability on mount
  useEffect(() => {
    setIsAvailable(isWalletAvailable())
    setDetectedWallet(detectWallet())
  }, [])

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      const restored = await restoreWalletSession()
      if (restored) {
        setWalletState(restored)
      }
    }
    restore()
  }, [])

  // Set up wallet event listeners
  useEffect(() => {
    if (!walletState.isConnected) return

    const cleanup = setupWalletListeners(
      async (accounts) => {
        // Account changed
        if (accounts.length > 0) {
          const newState = await getWalletState()
          setWalletState(newState)
        }
      },
      async (chainId) => {
        // Chain changed - only handle external changes (user changed in wallet extension)
        // Programmatic changes are handled by switchChain function
        if (!isSwitchingChainRef.current) {
          const newState = await getWalletState()
          setWalletState(newState)
        }
      },
      () => {
        // Disconnected
        setWalletState({
          isConnected: false,
          address: null,
          chainId: null,
          walletType: null,
          balance: null,
        })
      }
    )

    return cleanup
  }, [walletState.isConnected])

  const connect = useCallback(async (walletType?: WalletType) => {
    setIsConnecting(true)
    setError(null)

    try {
      const state = await connectWalletLib(walletType)
      setWalletState(state)
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet")
      throw err
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    disconnectWalletLib()
    setWalletState({
      isConnected: false,
      address: null,
      chainId: null,
      walletType: null,
      balance: null,
    })
    setError(null)
  }, [])

  const switchChain = useCallback(async (chainId: number): Promise<boolean> => {
    setIsSwitchingChain(true)
    isSwitchingChainRef.current = true
    try {
      const success = await switchChainLib(chainId)
      if (success) {
        const newState = await getWalletState()
        setWalletState(newState)
      }
      return success
    } finally {
      setIsSwitchingChain(false)
      isSwitchingChainRef.current = false
    }
  }, [])

  const refreshState = useCallback(async () => {
    if (!walletState.isConnected) return
    const newState = await getWalletState()
    setWalletState(newState)
  }, [walletState.isConnected])

  return {
    walletState,
    isConnecting,
    isSwitchingChain,
    isAvailable,
    detectedWallet,
    error,
    connect,
    disconnect,
    switchChain,
    refreshState,
  }
}
