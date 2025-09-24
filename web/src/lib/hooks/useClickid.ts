import { useEffect, useState } from 'react'
import { extractClickidFromInitData, trackUserClickid, getUserClickid } from '../postbacks'

/**
 * Hook to extract clickid from various sources
 * Priority: Telegram initData > URL parameters > localStorage
 */
export function useClickid(): string | null {
  const [clickid, setClickid] = useState<string | null>(null)

  useEffect(() => {
    const extractClickid = async () => {
      let foundClickid: string | null = null

      // 1. Try to get from Telegram WebApp initData
      if (typeof window !== 'undefined' && (window as unknown as { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp?.initData) {
        const initData = (window as unknown as { Telegram: { WebApp: { initData: string } } }).Telegram.WebApp.initData
        const extracted = extractClickidFromInitData(initData)
        if (extracted) {
          foundClickid = extracted
        }
      }

      // 2. Try to get from URL parameters (for testing)
      if (!foundClickid) {
        const urlParams = new URLSearchParams(window.location.search)
        const urlClickid = urlParams.get('clickid')
        if (urlClickid) {
          foundClickid = urlClickid
        }
      }

      // 3. Try to get from localStorage (fallback)
      if (!foundClickid) {
        const storedClickid = localStorage.getItem('propellerads_clickid')
        if (storedClickid) {
          foundClickid = storedClickid
        }
      }

      // 4. Try to get from server (user's associated clickid)
      if (!foundClickid) {
        const serverClickid = await getUserClickid()
        if (serverClickid) {
          foundClickid = serverClickid
        }
      }

      if (foundClickid) {
        setClickid(foundClickid)
        
        // Track the association with the server
        await trackUserClickid(foundClickid)
      }
    }

    extractClickid()
  }, [])

  // Store clickid in localStorage for persistence
  useEffect(() => {
    if (clickid) {
      localStorage.setItem('propellerads_clickid', clickid)
    }
  }, [clickid])

  return clickid
}
