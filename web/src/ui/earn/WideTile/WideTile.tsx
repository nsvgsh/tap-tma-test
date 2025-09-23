import React from 'react'
import styles from './WideTile.module.css'
import { Badge } from '../Badge/Badge'

export type WideTileProps = {
  id: string
  badgeNumber: number
  icon: 'chest' | 'target'
  ctaLabel?: string
  disabled?: boolean
  onClick?: (id: string) => void
  externalUrl?: string
}

export function WideTile({ id, badgeNumber, icon, ctaLabel, disabled, onClick, externalUrl }: WideTileProps) {
  const iconSrc = icon === 'target' ? '/ui/earn/Icon_Target.Png' : '/ui/earn/Icon_Chest.Png'
  
  const handleClick = () => {
    if (externalUrl) {
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
      </div>
    </div>
  )
}
