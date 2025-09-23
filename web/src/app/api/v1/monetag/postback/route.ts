export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { withClient } from '../../../../../lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    
    // Валидация входящих данных от Monetag
    const {
      zone_id,
      request_var,
      event_type,
      reward_event_type,
      sub_zone_id,
      variable2
    } = body

    // Проверяем что это событие для task_claim
    if (request_var !== 'task_claim') {
      return NextResponse.json({ error: 'Invalid request_var' }, { status: 400 })
    }

    // Проверяем что это событие impression
    if (event_type !== 'impression') {
      return NextResponse.json({ error: 'Invalid event_type' }, { status: 400 })
    }

    // Извлекаем user_id из variable2 (формат: "user_id:impression_id")
    if (!variable2 || typeof variable2 !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid variable2' }, { status: 400 })
    }

    const [userId, impressionId] = variable2.split(':')
    if (!userId || !impressionId) {
      return NextResponse.json({ error: 'Invalid variable2 format' }, { status: 400 })
    }

    // Определяем статус на основе reward_event_type
    const adStatus = reward_event_type === 'valued' ? 'closed' : 'failed'

    // Логируем событие в ad_events
    const result = await withClient(async (c) => {
      const payload = {
        impressionId,
        monetag: {
          zone_id,
          request_var,
          event_type,
          reward_event_type,
          sub_zone_id,
          variable2
        }
      }

      // Вставляем событие в ad_events
      await c.query(
        'insert into ad_events(id, user_id, session_id, provider, placement, status, reward_payload) values (gen_random_uuid(), $1, null, $2, $3, $4, $5)',
        [userId, 'monetag', 'task_claim', adStatus, JSON.stringify(payload)]
      )

      // Если событие closed (valued), помечаем все доступные задачи как выполненные
      if (adStatus === 'closed') {
        const { rows: availableTasks } = await c.query(`
          SELECT td.task_id 
          FROM task_definitions td
          LEFT JOIN task_progress tp ON td.task_id = tp.task_id AND tp.user_id = $1
          WHERE td.active = true 
          AND td.verification = 'none'
          AND (tp.state IS NULL OR tp.state != 'claimed')
        `, [userId])

        // Обновляем task_progress для всех доступных задач
        for (const task of availableTasks) {
          await c.query(`
            INSERT INTO task_progress(user_id, task_id, state, claimed_at) 
            VALUES ($1, $2, 'claimed', now())
            ON CONFLICT (user_id, task_id) 
            DO UPDATE SET state = 'claimed', claimed_at = now()
            WHERE task_progress.state != 'claimed'
          `, [userId, task.task_id])
        }

        return { 
          recorded: true, 
          impressionId,
          adStatus,
          tasksUpdated: availableTasks.length
        }
      } else {
        // Если событие failed, не обновляем task_progress
        return { 
          recorded: true, 
          impressionId,
          adStatus,
          tasksUpdated: 0
        }
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Monetag postback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
