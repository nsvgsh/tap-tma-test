# PropellerAds Postbacks Integration

## What & Why

### Business Context
Интеграция с системой постбеков PropellerAds для отслеживания конверсий и оптимизации рекламных кампаний.

### Functional Requirements

#### 1. Отслеживание кликов
- Создать страницу `/click` для обработки входящих кликов от PropellerAds
- URL формат: `https://tap-tma-test.vercel.app/click?clickid=123`
- Сохранять все параметры из URL в таблицу `ad_log`
- Редиректить пользователя в Telegram бот с передачей `clickid` в параметре `startapp`

#### 2. Postback System
Реализовать отправку постбеков по 3 целям:

**Цель 1: Открытие приложения**
- URL: `http://ad.propellerads.com/conversion.php?aid=3870762&pid=&tid=148085&visitor_id=${SUBID}&payout=${PAYOUT}`
- Триггер: При инициализации приложения

**Цель 2: Try for trial**
- URL: `http://ad.propellerads.com/conversion.php?aid=3870762&pid=&tid=148085&visitor_id=${SUBID}&payout=${PAYOUT}&goal=2`
- Триггер: Нажатие на кнопку "Try for trial" в модальном окне или широкой плитке

**Цель 3: Просмотр рекламы Monetag**
- URL: `http://ad.propellerads.com/conversion.php?aid=3870762&pid=&tid=148085&visitor_id=${SUBID}&payout=${PAYOUT}&goal=3`
- Триггер: После просмотра рекламы Monetag

#### 3. Data Storage
- Создать таблицу `ad_config` для хранения конфигурации постбеков
- Создать таблицу `ad_log` для логирования кликов и параметров

### Technical Requirements
- Заменять `${SUBID}` на `clickid` при отправке постбеков
- Извлекать `clickid` из Telegram WebApp initData
- Асинхронная отправка постбеков без блокировки UI
- Логирование всех операций для отладки

### Success Criteria
- [ ] Пользователи могут переходить по ссылкам PropellerAds
- [ ] Клики корректно сохраняются и редиректят в бот
- [ ] Postbacks отправляются при достижении каждой из 3 целей
- [ ] Система устойчива к ошибкам сети
- [ ] Все операции логируются для мониторинга

## Stakeholders
- Product Owner: Georg
- Developer: AI Assistant
- Users: Пользователи, переходящие по рекламным ссылкам PropellerAds
