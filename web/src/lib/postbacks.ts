/**
 * PropellerAds Postback Service
 * Handles sending conversion postbacks to PropellerAds
 */

/**
 * Track user clickid association
 */
export async function trackUserClickid(clickid: string): Promise<string | null> {
  try {
    const response = await fetch('/api/v1/user/click-tracking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clickid }),
    })

    if (!response.ok) {
      console.error('Failed to track user clickid:', response.status)
      return null
    }

    const result = await response.json()
    return result.success ? result.clickid : null
  } catch (error) {
    console.error('Error tracking user clickid:', error)
    return null
  }
}

/**
 * Get user's associated clickid
 */
export async function getUserClickid(): Promise<string | null> {
  try {
    const response = await fetch('/api/v1/user/click-tracking', {
      method: 'GET',
    })

    if (!response.ok) {
      return null
    }

    const result = await response.json()
    return result.success ? result.clickid : null
  } catch (error) {
    console.error('Error getting user clickid:', error)
    return null
  }
}

export interface PostbackConfig {
  goalId: number
  name: string
  urlTemplate: string
  isActive: boolean
}

export interface PostbackResult {
  success: boolean
  goalId: number
  clickid: string
  url?: string
  error?: string
}

/**
 * Extract clickid from Telegram WebApp initData
 */
export function extractClickidFromInitData(initData: string): string | null {
  try {
    const urlParams = new URLSearchParams(initData)
    const startParam = urlParams.get('start_param')
    
    if (startParam) {
      // start_param contains the clickid passed from /click page
      return startParam
    }
    
    return null
  } catch (error) {
    console.error('Failed to extract clickid from initData:', error)
    return null
  }
}

/**
 * Send postback to PropellerAds
 */
export async function sendPostback(
  goalId: number,
  clickid?: string,
  payout?: number
): Promise<PostbackResult> {
  try {
    // If no clickid provided, try to get user's associated clickid
    let finalClickid = clickid
    if (!finalClickid) {
      finalClickid = await getUserClickid()
    }

    if (!finalClickid) {
      return {
        success: false,
        goalId,
        clickid: '',
        error: 'No clickid available for postback'
      }
    }

    const response = await fetch('/api/v1/postbacks/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        goalId,
        clickid: finalClickid,
        payout
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Failed to send postback:', error)
    return {
      success: false,
      goalId,
      clickid: clickid || '',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Send postback for app open event
 */
export async function sendAppOpenPostback(clickid?: string): Promise<PostbackResult> {
  return sendPostback(1, clickid)
}

/**
 * Send postback for try for trial event
 */
export async function sendTryForTrialPostback(clickid?: string, payout?: number): Promise<PostbackResult> {
  return sendPostback(2, clickid, payout)
}

/**
 * Send postback for Monetag ad view event
 */
export async function sendMonetagAdViewPostback(clickid?: string, payout?: number): Promise<PostbackResult> {
  return sendPostback(3, clickid, payout)
}

/**
 * Postback goal IDs
 */
export const POSTBACK_GOALS = {
  APP_OPEN: 1,
  TRY_FOR_TRIAL: 2,
  MONETAG_AD_VIEW: 3
} as const

/**
 * Get postback goal name by ID
 */
export function getPostbackGoalName(goalId: number): string {
  switch (goalId) {
    case POSTBACK_GOALS.APP_OPEN:
      return 'App Open'
    case POSTBACK_GOALS.TRY_FOR_TRIAL:
      return 'Try for Trial'
    case POSTBACK_GOALS.MONETAG_AD_VIEW:
      return 'Monetag Ad View'
    default:
      return `Unknown Goal ${goalId}`
  }
}
