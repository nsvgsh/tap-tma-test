'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ClickPageContent() {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const clickid = searchParams.get('clickid')
    
    if (!clickid) {
      window.location.href = '/'
      return
    }

    // Log the click
    const logClick = async () => {
      try {
        const response = await fetch('/api/v1/ad/click-log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clickid,
            originalUrl: window.location.href,
            queryParams: Object.fromEntries(searchParams.entries()),
            userAgent: navigator.userAgent,
            ipAddress: 'unknown',
            redirectUrl: `https://t.me/test_tma_213124214_bot/testtap?startapp=${encodeURIComponent(clickid)}`
          }),
        })
        
        if (response.ok) {
          console.log('Click logged successfully')
        }
      } catch (error) {
        console.error('Failed to log click:', error)
      }
    }

    // Log click and redirect
    logClick()
    window.location.href = `https://t.me/test_tma_213124214_bot/testtap?startapp=${encodeURIComponent(clickid)}`
  }, [searchParams])

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1>Redirecting...</h1>
      <p>Please wait while we redirect you to the app.</p>
    </div>
  )
}

export default function ClickPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <h1>Loading...</h1>
        <p>Please wait...</p>
      </div>
    }>
      <ClickPageContent />
    </Suspense>
  )
}
