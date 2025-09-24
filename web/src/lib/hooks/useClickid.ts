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
      if (typeof window !== 'undefined') {
        const telegram = (window as unknown as { Telegram?: { WebApp?: { initData?: string } } }).Telegram
        console.log('useClickid: Telegram object:', telegram)
        
        if (telegram?.WebApp?.initData) {
          const initData = telegram.WebApp.initData
          console.log('useClickid: Found Telegram initData:', initData)
          const extracted = extractClickidFromInitData(initData)
          if (extracted) {
            foundClickid = extracted
            console.log('useClickid: Extracted clickid from initData:', extracted)
          } else {
            console.log('useClickid: No clickid found in initData')
          }
        } else {
          console.log('useClickid: No Telegram initData found')
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

      // 2.5. Try to get from URL hash (Telegram WebApp)
      if (!foundClickid) {
        const hash = window.location.hash
        console.log('useClickid: URL hash:', hash)
        
        // Look for tgWebAppStartParam in hash
        const startParamMatch = hash.match(/[?&]tgWebAppStartParam=([^&]+)/)
        if (startParamMatch) {
          foundClickid = startParamMatch[1]
          console.log('useClickid: Found clickid in URL hash startParam:', foundClickid)
        }
        
        // Also try to extract from tgWebAppData
        const tgWebAppDataMatch = hash.match(/[?&]tgWebAppData=([^&]+)/)
        if (tgWebAppDataMatch && !foundClickid) {
          try {
            const decodedData = decodeURIComponent(tgWebAppDataMatch[1])
            console.log('useClickid: Decoded tgWebAppData:', decodedData)
            const extracted = extractClickidFromInitData(decodedData)
            if (extracted) {
              foundClickid = extracted
              console.log('useClickid: Extracted clickid from tgWebAppData:', extracted)
            }
          } catch (error) {
            console.log('useClickid: Error decoding tgWebAppData:', error)
          }
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
