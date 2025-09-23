"use client"
import React from 'react'
import styles from './RewardBadge.module.css'

export type RewardBadgeProps = {
  value: number
  type: 'coins' | 'tickets'
  size?: 'small' | 'medium'
}

export function RewardBadge({ value, type, size = 'small' }: RewardBadgeProps) {
  const iconSrc = type === 'coins' 
    ? '/ui/header/ResourceBar_Icon_Gold.png' 
    : '/ui/header/Whisk_Purple_Ticket.png'
  
  const tone = type === 'coins' ? 'gold' : 'purple'
  
  return (
    <div className={`${styles.badge} ${styles[size]}`} data-tone={tone}>
      <img className={styles.icon} src={iconSrc} alt="" draggable={false} />
      <span className={styles.value}>{value.toLocaleString()}</span>
    </div>
  )
}
