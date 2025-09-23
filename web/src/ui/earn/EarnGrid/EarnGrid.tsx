import React from 'react'
import styles from './EarnGrid.module.css'
import { Tile, EarnTile } from '../Tile/Tile'
import { WideEarnTile } from '../../WideEarnTile/WideEarnTile'
import { EmptyState } from '../EmptyState/EmptyState'
import { TileSkeleton } from '../Skeletons/TileSkeleton'

// Deterministic icon selection based on taskId to avoid flicker on re-render
function pickIconForTask(id: string): 'chest' | 'target' {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0
  }
  return (h & 1) === 0 ? 'chest' : 'target'
}

export type EarnItem = {
  taskId: string
  rewardPayload: Record<string, unknown> | null
  state: 'available' | 'claimed' | string
}

export function EarnGrid(props: {
  available: EarnItem[] | null
  completed: EarnItem[] | null
  loading?: boolean
  activeTab: 'available' | 'completed'
  onTabChange: (tab: 'available' | 'completed') => void
  onWatch?: (taskId: string) => void
  onClaim?: (taskId: string) => void
  secondsLeft?: (taskId: string) => number | null
  userLevel?: number
}) {
  const { available, completed, loading, activeTab, onTabChange, onWatch, onClaim, secondsLeft, userLevel = 0 } = props

  const toTiles = (items: EarnItem[] | null): EarnTile[] => {
    if (!Array.isArray(items)) return []
    return items.map((it, idx) => ({
      id: it.taskId,
      badgeNumber: idx + 1,
      icon: pickIconForTask(it.taskId),
      ctaLabel: 'Open',
    }))
  }

  const list = activeTab === 'available' ? toTiles(available) : toTiles(completed)
  
  // Show wide button only on first level and available tab
  // The wide button should appear when user is exactly level 1
  const showWideButton = userLevel === 1 && activeTab === 'available'
  
  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('EarnGrid Debug:', { userLevel, activeTab, showWideButton, availableCount: available?.length })
  }

  return (
    <div className={styles.container}>
      <div className={styles.header} role="tablist" aria-label="Earn">
        {(['available','completed'] as const).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={[styles.tabBtn, activeTab === tab ? styles.tabBtnActive : ''].join(' ')}
            onClick={() => onTabChange(tab)}
            onPointerDown={(e) => { try { e.currentTarget.setAttribute('data-pressed', 'true') } catch {} }}
            onPointerUp={(e) => { try { e.currentTarget.removeAttribute('data-pressed') } catch {} }}
            onPointerCancel={(e) => { try { e.currentTarget.removeAttribute('data-pressed') } catch {} }}
            onPointerLeave={(e) => { try { e.currentTarget.removeAttribute('data-pressed') } catch {} }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.grid} aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (<TileSkeleton key={i} />))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState label={activeTab === 'available' ? 'No available offers' : 'No completed offers'} />
      ) : (
        <div className={styles.grid}>
          {showWideButton && (
            <WideEarnTile
              id="wide-trial-button"
              badgeNumber={0}
              icon="chest"
              ctaLabel="SIGN UP FOR FREE TRIAL"
              onClick={(id) => {
                // Handle wide button click - could open a modal or navigate
                console.log('Wide button clicked:', id)
                // For now, just log - you can add specific logic here
              }}
            />
          )}
          {list.map((t) => {
            const left = secondsLeft?.(t.id)
            const disabled = typeof left === 'number' && left <= 0
            return (
              <Tile key={t.id} tile={{ ...t, disabled }} onClick={(id) => {
                if (activeTab === 'available') {
                  const leftNow = secondsLeft?.(id)
                  if (leftNow && leftNow > 0) {
                    onClaim?.(id)
                  } else {
                    onWatch?.(id)
                  }
                }
              }} />
            )
          })}
        </div>
      )}
    </div>
  )
}
