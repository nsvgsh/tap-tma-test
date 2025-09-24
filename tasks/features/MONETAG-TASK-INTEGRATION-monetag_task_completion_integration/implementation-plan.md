# Implementation Plan — Monetag Task Completion Integration

## Architectural Analysis
- Monetag отправляет postback события на внешний URL при закрытии рекламы
- Нужно создать внутренний API endpoint для обработки этих событий
- События содержат `variable2` с форматом `user_id:impression_id`
- Необходимо связать события с конкретными задачами через `request_var: "task_claim"`
- Обновить логику получения задач для учета Monetag событий

## Task List

### 1. Создать API endpoint для Monetag postback
- Создать `/api/v1/monetag/postback/route.ts`
- Валидировать входящие данные от Monetag
- Извлекать `user_id` из `variable2` поля
- Обновлять `task_progress` для соответствующих задач

### 2. Модифицировать логику получения задач
- Обновить `/api/v1/tasks/route.ts` для учета Monetag событий
- Добавить проверку `ad_events` с `request_var: "task_claim"`
- Помечать задачи как выполненные если есть соответствующие события

### 3. Обновить frontend логику
- Модифицировать `watchAdForTask` функцию для корректной обработки
- Обновить отображение состояний задач в EARN секции

### 4. Добавить миграцию базы данных
- Создать миграцию для добавления индексов на `ad_events`
- Оптимизировать запросы для проверки Monetag событий

## Documentation Impact
- Обновить API документацию с новым endpoint
- Добавить описание интеграции с Monetag в техническую документацию
- Обновить схему базы данных

## Risk Assessment
- **Low Risk**: Изменения не затрагивают критическую логику наград
- **Medium Risk**: Нужно обеспечить корректную обработку внешних событий
- **Mitigation**: Добавить валидацию и логирование для отладки

## Testing Strategy
- Unit тесты для postback endpoint
- Integration тесты для проверки обновления task_progress
- E2E тесты для проверки отображения в EARN секции


