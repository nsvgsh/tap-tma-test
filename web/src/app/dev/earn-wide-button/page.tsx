"use client"
import React, { useMemo, useState } from 'react'
import { EarnGrid, EarnItem } from '@/ui/earn/EarnGrid/EarnGrid'

export default function DevEarnWideButtonPage() {
  const [tab, setTab] = useState<'available'|'completed'>('available')
  const [userLevel, setUserLevel] = useState(1) // Test with level 1 to show wide button
  
  const items = useMemo(() => ({
    available: [
      { taskId: 'task_aaaaaaaaaaaaaaa', rewardPayload: { coins: 100 }, state: 'available' },
      { taskId: 'task_bbbbbbbbbbbbbbb', rewardPayload: { coin_multiplier: 0.1 }, state: 'available' },
      { taskId: 'task_ccccccccccccccc', rewardPayload: { tickets: 1 }, state: 'available' },
    ] as EarnItem[],
    completed: [
      { taskId: 'task_xxxxxxxxxxxxxxx', rewardPayload: { coins: 50 }, state: 'claimed' },
    ] as EarnItem[],
  }), [])

  return (
    <main style={{ padding: 16 }}>
      <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f0f0f0', borderRadius: 8 }}>
        <h2>Earn Wide Button Test</h2>
        <div style={{ marginBottom: 8 }}>
          <label>
            User Level: 
            <select 
              value={userLevel} 
              onChange={(e) => setUserLevel(Number(e.target.value))}
              style={{ marginLeft: 8 }}
            >
              <option value={0}>0</option>
              <option value={1}>1 (Shows wide button)</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </label>
        </div>
        <div style={{ fontSize: 14, color: '#666' }}>
          Current level: {userLevel} | Wide button should show: {userLevel === 1 ? 'YES' : 'NO'}
        </div>
      </div>
      
      <EarnGrid
        loading={false}
        available={items.available}
        completed={items.completed}
        activeTab={tab}
        onTabChange={setTab}
        onWatch={() => {}}
        onClaim={() => {}}
        secondsLeft={() => null}
        userLevel={userLevel}
      />
    </main>
  )
}
