# Feature Request — Monetag Task Completion Integration

## WHAT
Интегрировать события закрытия рекламы Monetag с системой задач в EARN секции:
- При получении события `impression` с `request_var: "task_claim"` от Monetag
- Автоматически помечать соответствующую задачу как выполненную в таблице `task_progress`
- Исключать выполненные задачи из отображения в EARN секции

## WHY
- Пользователи должны видеть выполненные задачи как завершенные после просмотра рекламы
- Необходимо синхронизировать состояние задач между Monetag событиями и внутренней системой
- Обеспечить корректное отображение прогресса пользователя

## Scope
- Создать API endpoint для обработки postback событий от Monetag
- Модифицировать логику получения задач для учета Monetag событий
- Обновить frontend для корректного отображения состояний задач

## Out of Scope
- Изменение существующей логики claim задач
- Модификация системы наград
- Интеграция с другими рекламными сетями

## Acceptance Criteria
- Postback endpoint принимает события от Monetag с корректной валидацией
- Задачи автоматически помечаются как выполненные при получении события `impression`
- EARN секция корректно отображает выполненные задачи
- Система работает с существующей архитектурой TTL и idempotency

## Technical Details
- Postback URL: `https://d3rem.com/resolve?ruid=f7d9a82e-b79f-427e-8810-457dfe4fc1d2`
- Event data: `{zone_id: 9667281, request_var: "task_claim", event_type: "impression", reward_event_type: "non_valued", sub_zone_id: 9667281, variable2: "user_id:impression_id"}`
- Нужно извлекать `user_id` из `variable2` поля
- Обновлять `task_progress` таблицу для соответствующего пользователя и задачи


