import cssText from "data-text:~styles.css"
import type { PlasmoCSConfig, PlasmoGetInlineAnchorList } from "plasmo"
import { useState, useEffect } from "react"

import { TipButton } from "~components/TipButton"
import { TipModal } from "~components/TipModal"
import { lookupCreator, type Creator } from "~lib/api"

export const config: PlasmoCSConfig = {
  matches: ["https://*.substack.com/*"],
  all_frames: true
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

// Find author byline areas on Substack
export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  // Target the author section in post headers
  const anchors = document.querySelectorAll('.post-header .pencraft, .byline-wrapper')
  return Array.from(anchors).map((element) => ({
    element,
    insertPosition: "afterend"
  }))
}

// Extract handle from Substack URL (subdomain)
function getSubstackHandle(): string | null {
  const hostname = window.location.hostname
  const match = hostname.match(/^([^.]+)\.substack\.com$/)
  return match ? match[1] : null
}

interface TipzSubstackProps {
  anchor: {
    element: HTMLElement
  }
}

function TipzSubstack({ anchor }: TipzSubstackProps) {
  const [handle, setHandle] = useState<string | null>(null)
  const [creator, setCreator] = useState<Creator | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const extractedHandle = getSubstackHandle()
    setHandle(extractedHandle)

    if (extractedHandle) {
      lookupCreator("substack", extractedHandle)
        .then((result) => {
          if (result.found && result.creator) {
            setCreator(result.creator)
          }
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  if (!handle || isLoading) {
    return null
  }

  return (
    <>
      <div style={{ marginTop: "12px" }}>
        <TipButton
          creator={creator}
          handle={handle}
          onTip={() => setIsModalOpen(true)}
        />
      </div>
      <TipModal
        creator={creator}
        handle={handle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

export default TipzSubstack
