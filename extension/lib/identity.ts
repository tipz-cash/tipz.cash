/**
 * Creator Identity Management
 *
 * Handles storing and retrieving the linked creator identity
 * across the extension using chrome.storage.local
 */

export interface CreatorIdentity {
  handle: string
  verified: boolean
  verifiedAt: number
}

const CHROME_STORAGE_KEY = 'tipz_linked_creator'

/**
 * Get the linked creator identity from chrome.storage.local
 */
export async function getLinkedCreator(): Promise<CreatorIdentity | null> {
  try {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      const result = await chrome.storage.local.get([CHROME_STORAGE_KEY])
      const identity = result[CHROME_STORAGE_KEY] as CreatorIdentity | undefined

      if (identity && identity.handle && identity.verified) {
        return identity
      }
    }
    return null
  } catch (e) {
    console.error("TIPZ: Failed to get linked creator", e)
    return null
  }
}

/**
 * Set the linked creator identity in chrome.storage.local
 */
export async function setLinkedCreator(identity: CreatorIdentity): Promise<boolean> {
  try {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      await chrome.storage.local.set({ [CHROME_STORAGE_KEY]: identity })
      return true
    }
    return false
  } catch (e) {
    console.error("TIPZ: Failed to set linked creator", e)
    return false
  }
}

/**
 * Clear the linked creator identity (unlink)
 */
export async function clearLinkedCreator(): Promise<boolean> {
  try {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      await chrome.storage.local.remove([CHROME_STORAGE_KEY])
      return true
    }
    return false
  } catch (e) {
    console.error("TIPZ: Failed to clear linked creator", e)
    return false
  }
}

/**
 * Listen for changes to the linked creator identity
 */
export function onLinkedCreatorChange(
  callback: (identity: CreatorIdentity | null) => void
): () => void {
  if (typeof chrome === "undefined" || !chrome.storage?.onChanged) {
    return () => {}
  }

  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string
  ) => {
    if (areaName === 'local' && CHROME_STORAGE_KEY in changes) {
      const newValue = changes[CHROME_STORAGE_KEY].newValue as CreatorIdentity | undefined
      callback(newValue && newValue.verified ? newValue : null)
    }
  }

  chrome.storage.onChanged.addListener(listener)

  return () => {
    chrome.storage.onChanged.removeListener(listener)
  }
}
