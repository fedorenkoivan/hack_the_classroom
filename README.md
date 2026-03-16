# (PROD IS NOT ACTIVE)🎓 Hack the Classroom — SkillRoad

**SkillRoad** — веб-додаток для розробників, який допомагає об'єктивно оцінити технічний рівень за обраною інженерною роллю, отримати AI-оцінку відкритих відповідей і персональний roadmap із реальних GitHub-репозиторіїв для подальшого зростання.

---

## 🌐 Задеплоєний проєкт

| | URL |
|---|---|
| **Frontend** | https://hacktheclassroom.vercel.app |
| **API** | https://secure-luck-production-4679.up.railway.app |

---

## 💡 Яку проблему ми вирішуємо?

Починаючий розробник часто не розуміє:
- **Де він зараз** — Junior, Middle чи Strong Middle?
- **Для якої ролі він готовий** — Frontend, Backend, DevOps, ML тощо?
- **Що вчити далі** — з тисяч ресурсів складно обрати правильні
- **Як виміряти soft-знання** — тестами з варіантами відповідей неможливо оцінити глибину розуміння

**SkillRoad** вирішує це через двофазний квіз: спочатку MCQ-тест по навичках ролі, потім відкриті питання з AI-оцінкою від Gemini 2.5 Flash.

---

## ✨ Чому це рішення якісне?

- **10 інженерних ролей** — Frontend, Backend, Fullstack, DevOps, Mobile, Data, ML/AI, QA, Security, Embedded
- **Двофазний квіз** — MCQ для технічних знань + відкриті питання для глибини розуміння
- **AI-оцінка** — Gemini 2.5 Flash аналізує відкриті відповіді й дає персональний feedback
- **AI-summary** — після квізу генерується персоналізований опис кандидата
- **Без реєстрації** — анонімна сесія через `sessionStorage`
- **Реальні ресурси** — GitHub-репозиторії зберігаються в БД, підібрані під рівень
- **Продакшн-ready** — Railway (API + PostgreSQL Supabase) та Vercel (Frontend)

---

## 🛠 Технологічний стек

### Frontend
| Технологія | Версія | Роль |
|---|---|---|
| React | 19 | UI-фреймворк |
| TypeScript | 5.9 | Типізація |
| Tailwind CSS v4 | 4.x | Стилізація |
| Vite | 8 | Збірник |
| React Router | 7 | Клієнтська маршрутизація |
| Recharts | 2.x | Радарна діаграма результатів |
| Lucide React | — | Іконки |

### Backend
| Технологія | Версія | Роль |
|---|---|---|
| Node.js | 20+ | Runtime |
| Express | 5 | HTTP-фреймворк |
| TypeScript + tsx | — | Запуск TS без компіляції |
| Prisma | 6 | ORM + міграції |
| PostgreSQL (Supabase) | — | База даних |
| @google/genai | — | Gemini AI SDK |

### Інфраструктура
| Сервіс | Призначення |
|---|---|
| Vercel | Хостинг frontend |
| Railway | Хостинг API |
| Supabase | PostgreSQL (Transaction pooler) |
| Google AI Studio | Gemini API key (free tier) |

---

## 🤖 Де і чому ми використовуємо AI

SkillRoad використовує **Google Gemini 2.5 Flash** (`gemini-2.5-flash`) у двох місцях:

### 1. Оцінка відкритих відповідей — `POST /api/ai/evaluate`

**Де**: після MCQ-фази квізу кандидат отримує 2 відкритих питання, специфічних для обраної ролі (наприклад, для Frontend Engineer: _"Як би ти оптимізував Core Web Vitals?"_).

**Чому AI**: звичайний тест з варіантами відповідей не може перевірити глибину розуміння, здатність пояснити концепцію своїми словами або практичний досвід. AI-модель читає відповідь як досвідчений технічний інтерв'юер і повертає:
- **score** (0–10) — числова оцінка якості відповіді
- **feedback** — 1–2 речення конкретного конструктивного коментаря

### 2. Загальний AI-summary — `POST /api/ai/summary`

**Де**: на сторінці результатів, після отримання всіх оцінок.

**Чому AI**: замість шаблонного тексту кандидат отримує персоналізований опис (3–4 речення), який враховує загальний score по ролі, результати по кожному навику та оцінки відкритих питань. Текст звертається напряму ("Ви...") і є чесним, конструктивним і підбадьорливим.

**Модель**: `gemini-2.5-flash` — обрана за балансом ціна/якість: безкоштовний tier (1500 req/day), швидка відповідь (~1–2 с), відмінна якість для технічних текстів.

---

## 🏗 Архітектура проєкту

```
hack_the_classroom/
├── src/                          # Frontend (React + Vite)
│   └── app/
│       ├── pages/
│       │   ├── Home.tsx          # Вибір інженерної ролі (10 карток)
│       │   ├── Quiz.tsx          # Двофазний квіз (MCQ → відкриті питання)
│       │   └── Results.tsx       # Результати + AI feedback + roadmap
│       ├── data/
│       │   └── skillsData.ts     # Список ролей та відкритих питань
│       ├── api.ts                # HTTP-клієнт до backend API
│       └── styles/               # CSS per-page
├── api/                          # Backend (Express + Prisma)
│   ├── src/
│   │   ├── index.ts              # Точка входу, реєстрація роутів
│   │   └── routes/
│   │       ├── quiz.ts           # GET /api/quiz — питання з БД
│   │       ├── results.ts        # POST /api/results — збереження результатів
│   │       ├── skills.ts         # GET /api/skills
│   │       ├── repos.ts          # GET /api/repos
│   │       └── ai.ts             # POST /api/ai/evaluate, /api/ai/summary
│   └── prisma/
│       ├── schema.prisma         # Схема БД
│       ├── seed.ts               # Наповнення БД (10 skills, питання, repos)
│       └── migrations/           # SQL-міграції
└── vercel.json                   # Vercel config
```

### Потік даних

```
Користувач обирає роль (Home)
    ↓
Quiz завантажує MCQ-питання з /api/quiz (по skillSlugs ролі)
    ↓
MCQ-фаза → відкриті питання (з skillsData.ts)
    ↓
Submit: /api/ai/evaluate × 2 (паралельно) + /api/results
    ↓
Results: /api/ai/summary → показ score, AI feedback, roadmap
```

---

## 🗄 Схема бази даних

```
Skill (id, slug, label)
  ├── Question (text, order)
  │     └── QuestionOption (label, score: 1–5)
  └── Repo (name, url, level: junior|middle)

User (sessionId)
  └── UserSkill (skillId, score: 0–100, level)
```

---

## 🚀 Локальна розробка

### Передумови

- Node.js 20+
- npm 10+
- PostgreSQL або акаунт Supabase
- Gemini API ключ ([aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey))

### 1. Клонування репозиторію

```bash
git clone https://github.com/fedorenkoivan/hack_the_classroom.git
cd hack_the_classroom
```

### 2. Встановлення залежностей

```bash
# Frontend
npm install

# Backend
cd api && npm install && cd ..
```

### 3. Налаштування змінних середовища

Створи файл `api/.env`:

```env
# PostgreSQL (Supabase Transaction pooler)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true"

# Сервер
PORT=4000
CLIENT_URL="http://localhost:5173"

# Google Gemini (безкоштовний tier)
GEMINI_API_KEY="AIza..."
```

> **Важливо**: для Supabase використовуй **Transaction pooler** (порт 6543) з параметром `?pgbouncer=true`, щоб уникнути помилки `42P05` з prepared statements.

### 4. Міграції та наповнення БД

```bash
cd api

# Застосувати міграції
npx prisma migrate deploy

# Наповнити БД (10 skills, питання, репозиторії)
npm run seed
```

### 5. Запуск

У двох окремих терміналах:

```bash
# Термінал 1 — Backend (port 4000)
cd api && npm run dev

# Термінал 2 — Frontend (port 5173)
npm run dev
```

Відкрий [http://localhost:5173](http://localhost:5173).

### 6. Корисні команди

```bash
# Переглянути БД через Prisma Studio
cd api && npx prisma studio

# Перебілдити frontend
npm run build

# Lint
npm run lint
```

---

## 📦 Деплой

### Frontend → Vercel

1. Підключи репозиторій до Vercel
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Root Directory: `/` (не `api/`)

> `.npmrc` з `legacy-peer-deps=true` вже є в репозиторії для сумісності з `@tailwindcss/vite`.

### Backend → Railway

1. Підключи папку `api/` як окремий сервіс
2. Додай змінні середовища (`DATABASE_URL`, `PORT`, `CLIENT_URL`, `GEMINI_API_KEY`)
3. Start Command: `npm run dev` або `npx tsx src/index.ts`

---

## 👥 Команда

Проєкт розроблено в рамках **Hack the Classroom** hackathon.
