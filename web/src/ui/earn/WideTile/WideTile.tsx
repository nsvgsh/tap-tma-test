import React from 'react'
import styles from './WideTile.module.css'
import { Badge } from '../Badge/Badge'
import { RewardBadge } from '../RewardBadge/RewardBadge'
import { sendTryForTrialPostback } from '@/lib/postbacks'

export type WideTileProps = {
  id: string
  badgeNumber: number
  icon: 'chest' | 'target'
  ctaLabel?: string
  disabled?: boolean
  onClick?: (id: string) => void
  externalUrl?: string
  rewardPayload?: Record<string, unknown> | null
}

export function WideTile({ id, badgeNumber, icon, ctaLabel, disabled, onClick, externalUrl, rewardPayload }: WideTileProps) {
  const iconSrc = icon === 'target' ? '/ui/earn/Icon_Target.Png' : '/ui/earn/Icon_Chest.Png'
  
  // Extract reward values from payload
  const coins = typeof rewardPayload?.coins === 'number' ? rewardPayload.coins : 0
  const tickets = typeof rewardPayload?.tickets === 'number' ? rewardPayload.tickets : 0
  
  const handleClick = () => {
    if (externalUrl) {
      // Send postback for try for trial on wide tile
      sendTryForTrialPostback().catch(error => {
        console.error('Failed to send try for trial postback:', error);
      });
      
      // Open external URL in new tab
      try {
        window.open(externalUrl, '_blank', 'noopener,noreferrer')
      } catch (error) {
        console.error('Failed to open external link:', error)
        // Fallback: try to redirect in the same window
        try {
          window.location.href = externalUrl
        } catch (fallbackError) {
          console.error('Fallback redirect also failed:', fallbackError)
        }
      }
    } else {
      // Use regular onClick handler
      onClick?.(id)
    }
  }
  
  return (
    <div className={styles.root}>
      <div className={styles.badge}>
        <Badge number={badgeNumber} />
      </div>
      <div className={styles.card} role="group" aria-label="Earn item">
        <img className={styles.icon} src={iconSrc} alt="" draggable={false} />
        <button
          className={styles.cta}
          type="button"
          onPointerDown={(e) => { try { e.currentTarget.setAttribute('data-pressed', 'true') } catch {} }}
          onPointerUp={(e) => { try { e.currentTarget.removeAttribute('data-pressed') } catch {}; handleClick() }}
          onPointerCancel={(e) => { try { e.currentTarget.removeAttribute('data-pressed') } catch {} }}
          onPointerLeave={(e) => { try { e.currentTarget.removeAttribute('data-pressed') } catch {} }}
          disabled={disabled}
        >
          <span className={styles.ctaLabel}>{ctaLabel ?? 'SIGN UP FOR FREE TRIAL'}</span>
        </button>
        
        {/* Reward badges */}
        <div className={styles.rewards}>
          {coins > 0 && (
            <RewardBadge value={coins} type="coins" size="small" />
          )}
          {tickets > 0 && (
            <RewardBadge value={tickets} type="tickets" size="small" />
          )}
        </div>
      </div>
    </div>
  )
}
