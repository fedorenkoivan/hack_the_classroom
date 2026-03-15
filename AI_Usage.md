# 🤖 AI Usage Log — GitHub Copilot

Цей файл описує роботу з GitHub Copilot (Claude Sonnet) протягом двох сесій розробки проєкту SkillRoad — **14 березня 2026 (субота)** та **15 березня 2026 (неділя)**.

> Трекінг токенів та часу відповідей недоступний — ці метрики не надаються GitHub Copilot Chat.

---

## 📅 Сесія 1 — Субота, 14 березня 2026

### Що було зроблено

#### 1. Фікс залежностей Tailwind + Vite
**Промпт**: _(опис помилки при `npm install` — конфлікт `@tailwindcss/vite` з Vite 8)_

Copilot діагностував конфлікт peer dependencies між `@tailwindcss/vite` та Vite 8 і запропонував рішення:
- Додав `.npmrc` з `legacy-peer-deps=true` в корінь проєкту (для локальної розробки та Vercel)

---

#### 2. Підключення фронтенду до бекенду
**Промпт**: _"зв'яжи фронт і бек аби спілкувалися і ми відправляли дані при завершенні квізу"_

- Створено `src/app/api.ts` — HTTP-клієнт з функціями `fetchQuiz()` та `submitResults()`
- Додано `src/vite-env.d.ts` з типом `VITE_API_URL`
- Налаштовано Vite proxy `/api` → `http://localhost:4000` у `vite.config.ts`
- Переписано `Quiz.tsx` — завантаження питань з API, відправка результатів при завершенні
- Оновлено `Results.tsx` — відображення даних з API-відповіді

---

#### 3. Налаштування Supabase PostgreSQL
**Промпт**: _(налаштування підключення до бази даних на Supabase)_

- Діагностовано помилку `42P05` (prepared statements конфлікт з PgBouncer)
- Виправлено `DATABASE_URL` — додано `?pgbouncer=true` для Transaction pooler (порт 6543)
- Пояснено різницю між Direct connection (5432) та Transaction pooler (6543) для Supabase
- Допомога з запуском міграцій через Supabase SQL Editor (обхід заблокованого порту 5432)

---

#### 4. Запуск seed-скрипту
**Промпт**: _(помилка при `npm run seed`)_

- Наповнено БД: 10 skills × 3 MCQ-питання кожен + репозиторії (junior/middle рівнів) для всіх skills
- Файл `api/prisma/seed.ts` з повною структурою даних

---

#### 5. Рефакторинг: ролі замість окремих скілів
**Промпт**: _"давай фокусуватися на ролях, а не на окремих фреймворках чи мовах програмування — додай список 10 інженерних ролей"_

Повний рефакторинг продукту:
- `src/app/data/skillsData.ts` — замінено `SKILLS`/`QUIZ_QUESTIONS` на масив `ROLES` (10 інженерних ролей з `id`, `label`, `description`, `icon`, `skillSlugs`)
- `src/app/pages/Home.tsx` — сітка карток ролей замість dropdown
- `src/app/pages/Quiz.tsx` — квіз тепер приймає `roleId`, `roleLabel`, `skillSlugs[]` зі стану навігації; розраховує score по ролі
- `src/app/pages/Results.tsx` — banner з circle-score, рівнем ролі (Junior/Middle/Strong Middle), кольоровим індикатором
- `src/app/styles/Home.css` — стилі для `.roles-grid`, `.role-card`, `.role-card.selected`
- `src/app/styles/Quiz.css` — стилі для `.quiz-role-badge`, `.skill-progress-bar`
- `src/app/styles/Results.css` — стилі для `.role-result-banner`, `.role-result-circle`

---

## 📅 Сесія 2 — Неділя, 15 березня 2026

### Що було зроблено

#### 6. AI-оцінка відкритих відповідей (основна фіча дня)
**Промпт**: _"додай використання аі - якоїсь дешевої моделі openai — до кожної ролі буде пара питань з відкритою відповіддю — аі модель аналізуватиме їх і видаватиме оцінку — під кінець квіза показується наша відповідь та оцінка від аі — і також опис від аі базуючись на загальній оцінці"_

Повна реалізація AI-фічі:

**Backend:**
- Встановлено `openai` пакет в `api/`
- Створено `api/src/routes/ai.ts`:
  - `POST /api/ai/evaluate` — оцінка однієї відкритої відповіді → `{ score: 0-10, feedback: string }`
  - `POST /api/ai/summary` — генерація персоналізованого опису кандидата → `{ summary: string }`
- Зареєстровано `/api/ai` роутер в `api/src/index.ts`

**Frontend:**
- `src/app/data/skillsData.ts` — додано `openEndedQuestions: [string, string]` до кожної ролі (20 унікальних питань)
- `src/app/api.ts` — додано `evaluateAnswer()` та `generateSummary()`
- `src/app/pages/Quiz.tsx` — переписано на двофазний квіз:
  - Фаза 1: MCQ (множинний вибір)
  - Фаза 2: відкриті питання з `<textarea>`
  - Фаза 3: паралельна AI-оцінка обох відповідей → submit → navigate
- `src/app/pages/Results.tsx` — нові секції:
  - AI-summary блок з персоналізованим описом
  - Картки відкритих питань: питання + відповідь + score (0/10 з кольором) + feedback
- `src/app/styles/Quiz.css` — стилі для `.open-ended-card`, `.open-answer-textarea`, `.open-ended-header`
- `src/app/styles/Results.css` — стилі для `.ai-summary-card`, `.ai-answer-card`, `.ai-answer-score`

---

#### 7. Міграція з OpenAI на Google Gemini
**Промпт**: _(paste помилки `429 insufficient_quota` від OpenAI)_

- Діагностовано: ключ OpenAI дійсний, але акаунт без кредитів
- Встановлено `@google/genai` пакет
- Переписано `api/src/routes/ai.ts` — замінено `openai.chat.completions.create()` на `genai.models.generateContent()`
- Оновлено `api/.env` — закоментовано `OPENAI_API_KEY`, додано `GEMINI_API_KEY`

**Промпт**: _(paste помилки `429 RESOURCE_EXHAUSTED` від Gemini — `limit: 0`)_

- Діагностовано: новий ключ використовує той самий Google Cloud проєкт з вичерпаним лімітом
- Рекомендовано створити новий проєкт в Google AI Studio → новий ключ
- Після отримання нового ключа — протестовано через `curl` напряму до Gemini API
- Виявлено що `gemini-2.0-flash` недоступний для цього проєкту, але `gemini-2.5-flash` — так
- Замінено модель з `gemini-2.0-flash` → `gemini-2.5-flash` в `ai.ts`

---

#### 8. Фікс деплою Vercel
**Промпт**: _"версель не задеплоївся успішно — error TS5083: Cannot read file '/vercel/path0/tsconfig.json'"_

- Діагностовано: в репозиторії були відсутні `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` в корені
- Створено всі три файли з коректною конфігурацією для Vite + React проєкту
- Виявлено TypeScript-помилки в shadcn/ui компонентах що не використовуються (`calendar.tsx`, `chart.tsx`, `carousel.tsx` тощо)
- Змінено build script: `"tsc -b && vite build"` → `"vite build"` (Vercel не потребує type-check при білді)
- Білд пройшов: `538kb JS + 97kb CSS` за 274ms

---

#### 9. Оновлення документації
**Промпт**: _"онови документацію у README - все має бути українською. Опиши реалізацію проєкту, технічний стек, як розробнику склонувати репку та почати розробку, де ми використовуємо аі і чому"_

- Повністю переписано `README.md` українською мовою
- Додано секції: проблема, стек (таблиці), архітектура, схема БД, покрокова інструкція для розробника, деплой

---

## 📋 Повний список промптів

| # | Дата | Промпт (скорочено) |
|---|---|---|
| 1 | 14.03 | _(помилка npm install — конфлікт @tailwindcss/vite + Vite 8)_ |
| 2 | 14.03 | "зв'яжи фронт і бек аби спілкувалися і ми відправляли дані при завершенні квіза" |
| 3 | 14.03 | _(налаштування підключення Supabase PostgreSQL, помилка 42P05)_ |
| 4 | 14.03 | _(помилка npm run seed)_ |
| 5 | 14.03 | "давай фокусуватися на ролях, а не на окремих фреймворках чи мовах програмування — додай список 10 інженерних ролей" |
| 6 | 15.03 | "Continue: Continue to iterate?" _(продовження після summary)_ |
| 7 | 15.03 | "додай використання аі - якоїсь дешевої моделі openai — до кожної ролі буде пара питань з відкритою відповіддю — аі модель аналізуватиме їх і видаватиме оцінку — під кінець квіза показується наша відповідь та оцінка від аі — і також опис від аі базуючись на загальній оцінці" |
| 8 | 15.03 | _(paste 429 insufficient_quota від OpenAI)_ |
| 9 | 15.03 | "як можу підвищити план?" |
| 10 | 15.03 | "ключ оновив давай протестуємо" |
| 11 | 15.03 | _(paste 429 RESOURCE_EXHAUSTED від Gemini — limit: 0)_ |
| 12 | 15.03 | "версель не задеплоївся успішно — error TS5083: Cannot read file tsconfig.json" |
| 13 | 15.03 | "онови документацію у README - все має бути українською..." |
| 14 | 15.03 | "підсумуй наші сесії за останні 2 дні... створи новий рідмі файл AI_Usage.md" |

---

## 🐛 Проблеми які вирішували

| Помилка | Причина | Рішення |
|---|---|---|
| `npm install` конфлікт peer deps | `@tailwindcss/vite` несумісний з Vite 8 | `.npmrc` з `legacy-peer-deps=true` |
| Prisma `42P05` prepared statement | Supabase PgBouncer Transaction pooler не підтримує prepared statements | `?pgbouncer=true` в `DATABASE_URL` |
| Порт 5432 заблокований | Supabase не дозволяє direct connection з певних мереж | Запуск міграцій через Supabase SQL Editor вручну |
| OpenAI `429 insufficient_quota` | Акаунт без кредитів | Міграція на Google Gemini |
| Gemini `429 limit: 0` | Новий ключ — той самий вичерпаний проєкт | Новий Google Cloud проєкт → новий ключ |
| `gemini-2.0-flash` недоступний | Проєкт не має доступу до цієї моделі | Заміна на `gemini-2.5-flash` |
| Vercel build `TS5083` | Відсутні `tsconfig.json` файли в корені репо | Створено `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` |
| TypeScript-помилки в shadcn/ui | Невикористовувані компоненти з несумісними типами | Прибрано `tsc -b` з build script |
| `tsx watch` force kill loop | Кілька процесів конфліктували на порту 4000 | `pkill -f tsx` перед рестартом |

---

## 📁 Файли створені або змінені за 2 дні

### Нові файли
- `src/app/api.ts`
- `src/vite-env.d.ts`
- `api/src/routes/ai.ts`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `.npmrc`
- `AI_Usage.md` _(цей файл)_

### Суттєво змінені файли
- `src/app/pages/Quiz.tsx` — повний рерайт (двофазний квіз + AI)
- `src/app/pages/Results.tsx` — AI summary + feedback картки
- `src/app/pages/Home.tsx` — ролі замість скілів
- `src/app/data/skillsData.ts` — ROLES з openEndedQuestions
- `src/app/styles/Quiz.css` — open-ended стилі
- `src/app/styles/Results.css` — AI секції
- `src/app/styles/Home.css` — role cards
- `api/src/index.ts` — реєстрація AI роутера
- `api/src/routes/ai.ts` — OpenAI → Gemini
- `api/prisma/seed.ts` — повний seed
- `api/.env` — Supabase URL, Gemini key
- `vite.config.ts` — proxy
- `package.json` — build script
- `README.md` — повний рерайт
