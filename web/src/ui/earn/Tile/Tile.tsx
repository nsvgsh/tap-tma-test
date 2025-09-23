import React from 'react'
import styles from './Tile.module.css'
import { Badge } from '../Badge/Badge'
import { RewardBadge } from '../RewardBadge/RewardBadge'

export type EarnTile = {
  id: string
  badgeNumber: number
  icon: 'chest' | 'target'
  ctaLabel?: string
  disabled?: boolean
  rewardPayload?: Record<string, unknown> | null
}

export function Tile({ tile, onClick }: { tile: EarnTile; onClick?: (id: string) => void }) {
  const iconSrc = tile.icon === 'target' ? '/ui/earn/Icon_Target.Png' : '/ui/earn/Icon_Chest.Png'
  
  // Extract reward values from payload
  const coins = typeof tile.rewardPayload?.coins === 'number' ? tile.rewardPayload.coins : 0
  const tickets = typeof tile.rewardPayload?.tickets === 'number' ? tile.rewardPayload.tickets : 0
  
  return (
    <div className={styles.root}>
      <div className={styles.badge}>
        <Badge number={tile.badgeNumber} />
      </div>
      <div className={styles.card} role="group" aria-label="Earn item">
        <img className={styles.icon} src={iconSrc} alt="" draggable={false} />
        <button
          className={styles.cta}
          type="button"
          onPointerDown={(e) => { try { e.currentTarget.setAttribute('data-pressed', 'true') } catch {} }}
          onPointerUp={(e) => { try { e.currentTarget.removeAttribute('data-pressed') } catch {}; onClick?.(tile.id) }}
          onPointerCancel={(e) => { try { e.currentTarget.removeAttribute('data-pressed') } catch {} }}
          onPointerLeave={(e) => { try { e.currentTarget.removeAttribute('data-pressed') } catch {} }}
          disabled={tile.disabled}
        >
          <span className={styles.ctaLabel}>{tile.ctaLabel ?? 'Open'}</span>
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
