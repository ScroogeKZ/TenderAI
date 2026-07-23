# TenderAI — Платформа агрегации тендеров Казахстана с ИИ-ботом

**Версия**: v1.0 (Казахстан)  
**Технологический стек**: NestJS Backend Architecture, Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma, PostgreSQL + pgvector, Telegraf (Telegram Bot).

---

## 🚀 Возможности системы

1. **Агрегация данных (Module 1)**:
   - Коннекторы с двойной архитектурой (`ApiAdapter` / `ScraperAdapter`) для **goszakup.gov.kz** (веб-сервисы ЕГСЗ РК) и **portal.sk.kz** (АО "Самрук-Казына").
   - Соблюдение лимитов запросов (rate-limiting), дедупликация лотов и ведение логов аудита изменений (Audit Trail).

2. **Нормализация и обогащение (Module 2)**:
   - Единая структура данных: Заказчик, БИН, Регион, Сумма KZT, КТРУ/ОКЭД, Обеспечение заявки.
   - Оценка формальных рисков (короткие дедлайны, отмены конкурсов заказчиком).

3. **ИИ-Бот & Семантический поиск (Module 3)**:
   - Поиск по естественному языку ("ищу поставку серверов в Астане до 50 млн тенге").
   - Персональный семантический матчинг под профиль компании.
   - ИИ-суммаризация технического задания и RAG-чат по конкурсной документации.

4. **Интерактивный Telegram-Бот (Module 4)**:
   - Мгновенные push-уведомления о новых релевантных лотах.
   - Команды `/search`, `/profile`, `/digest` в Telegram.

5. **Командная воронка (Kanban - Module 5)**:
   - Этапы: *На рассмотрении* &rarr; *Готовим заявку* &rarr; *Подано в портал* &rarr; *Выиграли лот* &rarr; *Проиграли*.
   - Подсчет объема воронки в KZT.

6. **Административная панель (Module 6)**:
   - Мониторинг здоровья адаптеров парсинга, расхода ИИ-токенов и ручной запуск синхронизации.

7. **Тарифы & Kaspi Pay (Module 7)**:
   - Интеграция оплаты подписок в KZT через Kaspi QR (Free / Pro 29 900 ₸ / Team 69 900 ₸ / Enterprise 199 000 ₸).

---

## 🛠️ Запуск проекта

### 1. Установка зависимостей
```bash
npm install
```

### 2. Генерация схем Prisma
```bash
npx prisma generate
```

### 3. Запуск в режиме разработки
```bash
npm run dev
```
Откройте браузер по адресу: `http://localhost:3000`

---

## 🏗️ Структура проекта

```
Tender/
├── prisma/
│   └── schema.prisma         # База данных PostgreSQL (Tender, Source, Company, User, Kanban)
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Корневой лейаут с темной темой
│   │   ├── page.tsx          # Главное приложение TenderAI
│   │   └── globals.css       # Стили glassmorphic & Tailwind
│   ├── components/
│   │   ├── Navigation.tsx    # Шапка с выбором языков (RU/KK) и тарифом
│   │   ├── TenderCard.tsx    # Карточка тендера с ИИ-суммаризатором и индикатором рисков
│   │   ├── TenderDetailModal.tsx # Модальное окно с RAG-чатом и Audit Trail
│   │   ├── KanbanBoard.tsx   # Командная воронка
│   │   ├── CompanyProfileModal.tsx # Настройка семантического ИИ-матчинга
│   │   ├── AdminPanel.tsx    # Мониторинг коннекторов и токенов
│   │   ├── BillingModal.tsx  # Оплата через Kaspi Pay QR
│   │   └── TelegramBotModal.tsx # Симулятор Telegram-бота
│   └── lib/
│       ├── types/            # Доменные типы РК
│       ├── ingestion/        # Адаптеры Goszakup и Samruk-Kazyna
│       ├── services/         # AI Service, Telegram Service, Kaspi Service
│       └── mockData.ts       # Тестовый набор тендеров по регионам РК
├── tailwind.config.js
└── package.json
```
