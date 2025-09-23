import React from 'react'
import styles from './WideEarnTile.module.css'
import { Badge } from './Badge/Badge'

export type WideEarnTileProps = {
  id: string
  badgeNumber: number
  icon: 'chest' | 'target'
  ctaLabel?: string
  disabled?: boolean
  onClick?: (id: string) => void
}

export function WideEarnTile({ id, badgeNumber, icon, ctaLabel, disabled, onClick }: WideEarnTileProps) {
  const iconSrc = icon === 'target' ? '/ui/earn/Icon_Target.Png' : '/ui/earn/Icon_Chest.Png'
  
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
          onPointerUp={(e) => { try { e.currentTarget.removeAttribute('data-pressed') } catch {}; onClick?.(id) }}
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
