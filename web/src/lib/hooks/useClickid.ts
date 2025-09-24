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
      console.log('useClickid: Starting clickid extraction...')
      let foundClickid: string | null = null

      // 1. Try to get from Telegram WebApp initData
      if (typeof window !== 'undefined' && (window as unknown as { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp?.initData) {
        const initData = (window as unknown as { Telegram: { WebApp: { initData: string } } }).Telegram.WebApp.initData
        console.log('useClickid: Found Telegram initData:', initData)
        const extracted = extractClickidFromInitData(initData)
        if (extracted) {
          foundClickid = extracted
          console.log('useClickid: Extracted clickid from initData:', extracted)
        }
      }

      // 2. Try to get from URL parameters (for testing)
      if (!foundClickid) {
        const urlParams = new URLSearchParams(window.location.search)
        const urlClickid = urlParams.get('clickid')
        if (urlClickid) {
          foundClickid = urlClickid
          console.log('useClickid: Found clickid in URL:', urlClickid)
        }
      }

      // 3. Try to get from localStorage (fallback)
      if (!foundClickid) {
        const storedClickid = localStorage.getItem('propellerads_clickid')
        if (storedClickid) {
          foundClickid = storedClickid
          console.log('useClickid: Found clickid in localStorage:', storedClickid)
        }
      }

      // 4. Try to get from server (user's associated clickid)
      if (!foundClickid) {
        console.log('useClickid: Trying to get clickid from server...')
        const serverClickid = await getUserClickid()
        if (serverClickid) {
          foundClickid = serverClickid
          console.log('useClickid: Found clickid from server:', serverClickid)
        } else {
          console.log('useClickid: No clickid found on server')
        }
      }

      if (foundClickid) {
        console.log('useClickid: Setting clickid:', foundClickid)
        setClickid(foundClickid)
        
        // Track the association with the server
        console.log('useClickid: Tracking user clickid association...')
        const result = await trackUserClickid(foundClickid)
        if (result) {
          console.log('useClickid: Successfully tracked user clickid:', result)
        } else {
          console.log('useClickid: Failed to track user clickid')
        }
      } else {
        console.log('useClickid: No clickid found from any source')
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
