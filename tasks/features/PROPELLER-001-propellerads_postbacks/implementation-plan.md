# PropellerAds Postbacks Implementation Plan

## Architectural Analysis

### Current System Context
- Next.js приложение с API routes
- Supabase база данных с существующими таблицами
- Telegram WebApp интеграция с initData
- Monetag SDK для показа рекламы
- Модальные окна с интеграциями

### New Components Architecture

#### 1. Database Schema
```sql
-- Конфигурация постбеков
CREATE TABLE ad_config (
  id SERIAL PRIMARY KEY,
  goal_id INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  url_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Логирование кликов
CREATE TABLE ad_log (
  id SERIAL PRIMARY KEY,
  clickid VARCHAR(255) NOT NULL,
  original_url TEXT NOT NULL,
  query_params JSONB NOT NULL,
  user_agent TEXT,
  ip_address INET,
  redirect_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Связь пользователей с кликами
CREATE TABLE user_click_tracking (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(user_id),
  clickid VARCHAR(255) NOT NULL,
  first_seen_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, clickid)
);
```

#### 2. Click Tracking Flow
```
PropellerAds Link → /click page → Parse params → Save to ad_log → Redirect to Telegram Bot
```

#### 3. Postback Flow
```
User Action → Get user's associated clickid → Send postback to PropellerAds → Log result
```

#### 4. User-Click Association Flow
```
User opens app → Extract clickid from initData/URL → Associate with user_id → Store in user_click_tracking
```

### Integration Points

#### Existing Components to Modify
1. **Telegram WebApp initialization** - извлечение clickid из initData
2. **Modal components** - добавление постбеков при нажатии "Try for trial"
3. **Monetag integration** - постбек после просмотра рекламы
4. **App initialization** - постбек при открытии приложения

#### New Components
1. **Click tracking page** (`/click`)
2. **Postback service** (API route)
3. **User-click tracking API** (`/api/v1/user/click-tracking`)
4. **Database migrations** (ad_config, ad_log, user_click_tracking)
5. **Utility functions** для работы с постбеками

## Task List

### Phase 1: Database Setup
- [ ] **TASK-1**: Создать миграцию для таблицы `ad_config`
- [ ] **TASK-2**: Создать миграцию для таблицы `ad_log`
- [ ] **TASK-3**: Добавить индексы для оптимизации запросов

### Phase 2: Click Tracking
- [ ] **TASK-4**: Создать страницу `/click` для обработки входящих кликов
- [ ] **TASK-5**: Реализовать парсинг URL параметров
- [ ] **TASK-6**: Добавить сохранение в `ad_log`
- [ ] **TASK-7**: Настроить редирект в Telegram бот

### Phase 3: Postback System
- [ ] **TASK-8**: Создать API route `/api/v1/postbacks/send`
- [ ] **TASK-9**: Реализовать утилиты для отправки постбеков
- [ ] **TASK-10**: Добавить обработку ошибок и retry логику
- [ ] **TASK-11**: Создать конфигурацию постбеков в `ad_config`

### Phase 4: Integration
- [ ] **TASK-12**: Интегрировать постбек "открытие приложения"
- [ ] **TASK-13**: Интегрировать постбек "Try for trial" в модальные окна
- [ ] **TASK-14**: Интегрировать постбек "просмотр рекламы Monetag"
- [ ] **TASK-15**: Добавить извлечение clickid из Telegram initData

### Phase 5: Testing & Monitoring
- [ ] **TASK-16**: Добавить логирование всех операций
- [ ] **TASK-17**: Создать тестовые сценарии
- [ ] **TASK-18**: Добавить мониторинг ошибок

## Technical Implementation Details

### Click Tracking Implementation
```typescript
// /click page structure
export default function ClickPage({ searchParams }: { searchParams: URLSearchParams }) {
  // 1. Extract clickid and other params
  // 2. Save to ad_log table
  // 3. Redirect to Telegram bot with startapp parameter
}
```

### Postback Service
```typescript
// Postback service structure
class PostbackService {
  async sendPostback(goalId: number, clickid: string, payout?: number): Promise<boolean>
  async getConfig(goalId: number): Promise<AdConfig>
  async logPostbackAttempt(config: AdConfig, clickid: string, success: boolean)
}
```

### Integration Points
1. **App initialization**: Вызов постбека в `_app.tsx` или layout
2. **Modal buttons**: Добавление обработчиков в компоненты модальных окон
3. **Monetag callbacks**: Интеграция в существующие callback'и Monetag SDK

## Documentation Impact

### New Documentation Needed
- [ ] API documentation для `/api/v1/postbacks/send`
- [ ] Database schema documentation
- [ ] Integration guide для новых постбеков
- [ ] Troubleshooting guide для отладки постбеков

### Existing Documentation Updates
- [ ] Обновить `api-contracts.md` с новыми endpoints
- [ ] Обновить `db-schema.sql` с новыми таблицами
- [ ] Обновить `deploy-pipeline.md` если нужны новые env переменные

## Risk Assessment

### High Risk
- **Сетевые ошибки**: Postbacks могут не доходить до PropellerAds
- **Telegram initData**: Изменения в формате initData могут сломать извлечение clickid

### Medium Risk
- **Производительность**: Дополнительные HTTP запросы могут замедлить приложение
- **Rate limiting**: PropellerAds может ограничивать количество запросов

### Low Risk
- **Database performance**: Новые таблицы с индексами не должны влиять на производительность
- **URL parsing**: Стандартные методы парсинга URL параметров

## Mitigation Strategies
1. **Асинхронная отправка**: Postbacks отправляются в фоне без блокировки UI
2. **Retry logic**: Повторные попытки отправки при ошибках
3. **Graceful degradation**: Приложение работает даже если постбеки не отправляются
4. **Comprehensive logging**: Детальное логирование для отладки

## Success Metrics
- [ ] 100% кликов сохраняются в ad_log
- [ ] 95%+ успешных отправок постбеков
- [ ] <100ms дополнительное время загрузки страниц
- [ ] 0 критических ошибок в production
