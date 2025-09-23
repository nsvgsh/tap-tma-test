export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { withClient } from '../../../../lib/db'

export async function GET() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('dev_session')?.value
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const data = await withClient(async (c) => {
    const defs = await c.query(
      'select task_id as "taskId", unlock_level as "unlockLevel", kind, reward_payload as "rewardPayload", verification from task_definitions where active=true order by unlock_level'
    )
    const prog = await c.query(
      'select task_id as "taskId", state, claimed_at as "claimedAt" from task_progress where user_id=$1',
      [userId]
    )
    const lvl = await c.query('select level from user_counters where user_id=$1', [userId])
    const userLevel = Number(lvl.rows[0]?.level || 0)

    // Проверяем, есть ли у пользователя клики по try_for_free в modal_clicks
    const tryForFreeClicks = await c.query(
      'select count(*) as count from modal_clicks where user_id=$1 and click_type=$2',
      [userId, 'try_for_free']
    )
    const hasTryForFreeClick = Number(tryForFreeClicks.rows[0]?.count || 0) > 0

    // Проверяем Monetag события для task_claim (только closed события)
    const monetagClosedEvents = await c.query(
      'select reward_payload from ad_events where user_id=$1 and provider=$2 and placement=$3 and status=$4',
      [userId, 'monetag', 'task_claim', 'closed']
    )

    // Создаем Set с taskId из Monetag событий
    const monetagCompletedTasks = new Set<string>()
    for (const event of monetagClosedEvents.rows) {
      const payload = event.reward_payload
      if (payload && typeof payload === 'object' && 'intent' in payload) {
        const intent = payload.intent as string
        if (intent.startsWith('task:')) {
          const taskId = intent.replace('task:', '')
          monetagCompletedTasks.add(taskId)
        }
      }
    }

    const progressByTaskId = new Map<string, { taskId: string; state: string; claimedAt: string | null }>()
    for (const p of prog.rows as { taskId: string; state: string; claimedAt: string | null }[]) {
      progressByTaskId.set(p.taskId, p)
    }

    const definitions = (defs.rows as { taskId: string; unlockLevel: number; kind: string; rewardPayload: unknown; verification: string }[]).map(
      (d) => {
        const p = progressByTaskId.get(d.taskId)
        
        // Если задача уже помечена как claimed в task_progress, используем это состояние
        if (p?.state === 'claimed') {
          return { ...d, state: 'claimed', wide: false }
        }
        
        // Если есть Monetag closed событие для этой конкретной задачи, помечаем как claimed
        if (monetagCompletedTasks.has(d.taskId) && d.verification === 'none') {
          return { ...d, state: 'claimed', wide: false }
        }
        
        // Используем стандартную логику разблокировки по уровню
        const state = d.unlockLevel <= userLevel ? 'available' : 'locked'
        return { ...d, state, wide: false }
      }
    )

    return { definitions, progress: prog.rows, userLevel }
  })

  return NextResponse.json(data)
}
