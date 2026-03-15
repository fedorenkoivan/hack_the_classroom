/**
 * Seed script: наповнює БД скілами, репозиторіями та квізами.
 * Запуск: npm run seed
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ─── Типи ─────────────────────────────────────────────────────────────────────

type QuizDef = {
  skillSlug: string
  skillLabel: string
  questions: {
    text: string
    order: number
    options: { label: string; score: number }[]
  }[]
}

// ─── Квізи ────────────────────────────────────────────────────────────────────

const QUIZZES: QuizDef[] = [
  // ── JavaScript ──────────────────────────────────────────────────────────────
  {
    skillSlug: 'js',
    skillLabel: 'JavaScript',
    questions: [
      {
        text: 'Наскільки впевнено працюєш із замиканнями (closures)?',
        order: 1,
        options: [
          { label: 'Лише чув(ла)', score: 1 },
          { label: 'Розумію теорію', score: 2 },
          { label: 'Використовую інколи', score: 3 },
          { label: 'Використовую регулярно', score: 4 },
          { label: 'Пояснюю іншим + оптимізую', score: 5 },
        ],
      },
      {
        text: 'Як добре знаєш event loop та async/await?',
        order: 2,
        options: [
          { label: 'Базовий рівень', score: 1 },
          { label: 'Можу написати прості async сценарії', score: 2 },
          { label: 'Розрізняю microtask/macrotask', score: 3 },
          { label: 'Дебажу race conditions', score: 4 },
          { label: 'Проєктую складні async-потоки', score: 5 },
        ],
      },
      {
        text: 'Який твій рівень роботи з масивами/об\'єктами та функціональними методами?',
        order: 3,
        options: [
          { label: 'for/if тільки', score: 1 },
          { label: 'map/filter/reduce на базовому рівні', score: 2 },
          { label: 'Пишу чистий код без мутацій', score: 3 },
          { label: 'Оптимізую перетворення даних', score: 4 },
          { label: 'Будую reusable утиліти', score: 5 },
        ],
      },
    ],
  },

  // ── TypeScript ───────────────────────────────────────────────────────────────
  {
    skillSlug: 'ts',
    skillLabel: 'TypeScript',
    questions: [
      {
        text: 'Наскільки впевнено працюєш із type aliases та interfaces?',
        order: 1,
        options: [
          { label: 'Плутаюся', score: 1 },
          { label: 'Використовую для простих моделей', score: 2 },
          { label: 'Розумію різницю і коли що краще', score: 3 },
          { label: 'Створюю гнучкі типи для API', score: 4 },
          { label: 'Пишу архітектурно стійкі типи', score: 5 },
        ],
      },
      {
        text: 'Як працюєш із generic-типами?',
        order: 2,
        options: [
          { label: 'Майже не використовую', score: 1 },
          { label: 'Читаю, але рідко пишу сам(а)', score: 2 },
          { label: 'Пишу generic функції', score: 3 },
          { label: 'Пишу generic компоненти/хуки', score: 4 },
          { label: 'Комбіную generics, constraints, infer', score: 5 },
        ],
      },
      {
        text: 'Наскільки впевнено використовуєш utility types (Pick, Omit, Partial…)?',
        order: 3,
        options: [
          { label: 'Знаю кілька назв', score: 1 },
          { label: 'Інколи використовую', score: 2 },
          { label: 'Використовую регулярно', score: 3 },
          { label: 'Комбіную для складних кейсів', score: 4 },
          { label: 'Проєктую свої typed-патерни', score: 5 },
        ],
      },
    ],
  },

  // ── React ────────────────────────────────────────────────────────────────────
  {
    skillSlug: 'react',
    skillLabel: 'React',
    questions: [
      {
        text: 'Як добре розумієш хуки useState та useEffect?',
        order: 1,
        options: [
          { label: 'Ледве знайомий(а)', score: 1 },
          { label: 'Використовую в простих компонентах', score: 2 },
          { label: 'Розумію залежності та cleanup', score: 3 },
          { label: 'Оптимізую ре-рендери', score: 4 },
          { label: 'Пишу власні хуки та оптимізую з useMemo/useCallback', score: 5 },
        ],
      },
      {
        text: 'Який твій рівень управління станом (state management)?',
        order: 2,
        options: [
          { label: 'Тільки локальний useState', score: 1 },
          { label: 'Передаю пропси між компонентами', score: 2 },
          { label: 'Використовую Context API', score: 3 },
          { label: 'Знаю Redux / Zustand', score: 4 },
          { label: 'Вибираю рішення під задачу + знаю trade-offs', score: 5 },
        ],
      },
      {
        text: 'Наскільки впевнено працюєш із рендерингом списків та умовним рендерингом?',
        order: 3,
        options: [
          { label: 'Плутаюся з key', score: 1 },
          { label: 'Рендерю прості списки', score: 2 },
          { label: 'Розумію важливість key для перформансу', score: 3 },
          { label: 'Оптимізую великі списки (virtualization)', score: 4 },
          { label: 'Проєктую reusable компоненти для будь-яких даних', score: 5 },
        ],
      },
    ],
  },

  // ── Node.js ──────────────────────────────────────────────────────────────────
  {
    skillSlug: 'nodejs',
    skillLabel: 'Node.js',
    questions: [
      {
        text: 'Як добре знаєш модульну систему Node.js (CommonJS / ESM)?',
        order: 1,
        options: [
          { label: 'Плутаюся між require та import', score: 1 },
          { label: 'Використовую один стиль', score: 2 },
          { label: 'Розумію різницю і можу мікшувати', score: 3 },
          { label: 'Налаштовую конфігурацію модулів у проєкті', score: 4 },
          { label: 'Оптимізую завантаження модулів та tree-shaking', score: 5 },
        ],
      },
      {
        text: 'Який твій рівень роботи з Express або іншими HTTP-фреймворками?',
        order: 2,
        options: [
          { label: 'Ніколи не будував(ла) API', score: 1 },
          { label: 'Простий CRUD з Express', score: 2 },
          { label: 'Middleware, маршрутизація, обробка помилок', score: 3 },
          { label: 'Аутентифікація, валідація, rate limiting', score: 4 },
          { label: 'Проєктую масштабовані API з моніторингом', score: 5 },
        ],
      },
      {
        text: 'Наскільки впевнено працюєш із потоками (streams) та буферами?',
        order: 3,
        options: [
          { label: 'Не знаю що це', score: 1 },
          { label: 'Чув(ла), але не використовував(ла)', score: 2 },
          { label: 'Читаю/пишу файли через streams', score: 3 },
          { label: 'Будую пайплайни трансформацій', score: 4 },
          { label: 'Оптимізую memory-efficient обробку великих даних', score: 5 },
        ],
      },
    ],
  },

  // ── Python ───────────────────────────────────────────────────────────────────
  {
    skillSlug: 'python',
    skillLabel: 'Python',
    questions: [
      {
        text: 'Як добре знаєш базові структури даних Python (list, dict, set)?',
        order: 1,
        options: [
          { label: 'Знаю тільки list', score: 1 },
          { label: 'Використовую всі три', score: 2 },
          { label: 'Обираю правильну структуру під задачу', score: 3 },
          { label: 'Знаю comprehensions та генератори', score: 4 },
          { label: 'Аналізую складність O(n) та оптимізую', score: 5 },
        ],
      },
      {
        text: 'Який твій рівень розуміння ООП у Python?',
        order: 2,
        options: [
          { label: 'Не використовую класи', score: 1 },
          { label: 'Пишу прості класи', score: 2 },
          { label: 'Спадкування, dunder-методи', score: 3 },
          { label: 'Декоратори, mixins, ABC', score: 4 },
          { label: 'Проєктую патерни та метакласи', score: 5 },
        ],
      },
      {
        text: 'Наскільки впевнено працюєш із бібліотеками для роботи з даними (pandas, numpy)?',
        order: 3,
        options: [
          { label: 'Не використовував(ла)', score: 1 },
          { label: 'Базові операції з DataFrame', score: 2 },
          { label: 'Фільтрація, групування, merge', score: 3 },
          { label: 'Векторизовані операції, оптимізація пам\'яті', score: 4 },
          { label: 'Будую пайплайни обробки великих датасетів', score: 5 },
        ],
      },
    ],
  },

  // ── Git ──────────────────────────────────────────────────────────────────────
  {
    skillSlug: 'git',
    skillLabel: 'Git',
    questions: [
      {
        text: 'Як добре знаєш базові команди Git (commit, push, pull, branch)?',
        order: 1,
        options: [
          { label: 'Тільки commit і push', score: 1 },
          { label: 'Працюю з гілками', score: 2 },
          { label: 'Merge, rebase, cherry-pick', score: 3 },
          { label: 'Вирішую конфлікти, використовую stash', score: 4 },
          { label: 'Git hooks, submodules, worktrees', score: 5 },
        ],
      },
      {
        text: 'Який твій рівень розуміння Git Flow та стратегій гілкування?',
        order: 2,
        options: [
          { label: 'Все в main', score: 1 },
          { label: 'Окремі гілки для фіч', score: 2 },
          { label: 'Знаю Git Flow або trunk-based', score: 3 },
          { label: 'Адаптую стратегію під проєкт', score: 4 },
          { label: 'Впроваджую процеси в команді', score: 5 },
        ],
      },
      {
        text: 'Наскільки впевнено пишеш commit messages та ведеш історію проєкту?',
        order: 3,
        options: [
          { label: 'Довільні повідомлення', score: 1 },
          { label: 'Короткі описові повідомлення', score: 2 },
          { label: 'Дотримуюся Conventional Commits', score: 3 },
          { label: 'Squash, rebase для чистої історії', score: 4 },
          { label: 'Автоматизую changelog з commit-history', score: 5 },
        ],
      },
    ],
  },

  // ── SQL ──────────────────────────────────────────────────────────────────────
  {
    skillSlug: 'sql',
    skillLabel: 'SQL',
    questions: [
      {
        text: 'Як добре знаєш базові SQL-запити (SELECT, INSERT, UPDATE, DELETE)?',
        order: 1,
        options: [
          { label: 'Знаю тільки SELECT', score: 1 },
          { label: 'CRUD-операції', score: 2 },
          { label: 'JOIN, GROUP BY, агрегатні функції', score: 3 },
          { label: 'Підзапити, CTE, window functions', score: 4 },
          { label: 'Оптимізація запитів, EXPLAIN ANALYZE', score: 5 },
        ],
      },
      {
        text: 'Який твій рівень проєктування схем баз даних?',
        order: 2,
        options: [
          { label: 'Одна таблиця', score: 1 },
          { label: 'Декілька таблиць без нормалізації', score: 2 },
          { label: 'Нормалізація до 3NF, foreign keys', score: 3 },
          { label: 'Індекси, партиціонування', score: 4 },
          { label: 'Проєктую для high-load з урахуванням масштабування', score: 5 },
        ],
      },
      {
        text: 'Наскільки впевнено працюєш із транзакціями та рівнями ізоляції?',
        order: 3,
        options: [
          { label: 'Не знаю що це', score: 1 },
          { label: 'Знаю BEGIN/COMMIT/ROLLBACK', score: 2 },
          { label: 'Розумію dirty read та phantom read', score: 3 },
          { label: 'Обираю рівень ізоляції під задачу', score: 4 },
          { label: 'Діагностую deadlocks та оптимізую', score: 5 },
        ],
      },
    ],
  },

  // ── CSS ──────────────────────────────────────────────────────────────────────
  {
    skillSlug: 'css',
    skillLabel: 'CSS',
    questions: [
      {
        text: 'Як добре знаєш Flexbox та CSS Grid?',
        order: 1,
        options: [
          { label: 'Використовую тільки float', score: 1 },
          { label: 'Базовий Flexbox', score: 2 },
          { label: 'Flexbox + Grid для складних лейаутів', score: 3 },
          { label: 'Адаптивні лейаути без media queries', score: 4 },
          { label: 'Будую design system з Grid + Custom Properties', score: 5 },
        ],
      },
      {
        text: 'Який твій рівень роботи з CSS-анімаціями та transitions?',
        order: 2,
        options: [
          { label: 'Не використовую', score: 1 },
          { label: 'Прості hover transition', score: 2 },
          { label: 'Keyframe анімації', score: 3 },
          { label: 'Перформанс анімацій (transform, will-change)', score: 4 },
          { label: 'Складні sequence анімації, GSAP або Motion', score: 5 },
        ],
      },
      {
        text: 'Наскільки впевнено пишеш responsive дизайн?',
        order: 3,
        options: [
          { label: 'Фіксована ширина', score: 1 },
          { label: 'Базові media queries', score: 2 },
          { label: 'Mobile-first підхід', score: 3 },
          { label: 'Container queries, clamp(), fluid typography', score: 4 },
          { label: 'Accessibility + responsive + dark mode системно', score: 5 },
        ],
      },
    ],
  },

  // ── Docker ───────────────────────────────────────────────────────────────────
  {
    skillSlug: 'docker',
    skillLabel: 'Docker',
    questions: [
      {
        text: 'Як добре знаєш основні команди Docker (build, run, pull, push)?',
        order: 1,
        options: [
          { label: 'Ніколи не використовував(ла)', score: 1 },
          { label: 'Запускаю готові образи', score: 2 },
          { label: 'Пишу Dockerfile для своїх проєктів', score: 3 },
          { label: 'Multi-stage builds, оптимізую розмір образу', score: 4 },
          { label: 'BuildKit, кешування шарів, security scanning', score: 5 },
        ],
      },
      {
        text: 'Який твій рівень роботи з Docker Compose?',
        order: 2,
        options: [
          { label: 'Не знаю що це', score: 1 },
          { label: 'Запускаю чужий compose файл', score: 2 },
          { label: 'Пишу compose для локального розробки', score: 3 },
          { label: 'Networks, volumes, health checks', score: 4 },
          { label: 'Profiles, secrets, production-grade compose', score: 5 },
        ],
      },
      {
        text: 'Наскільки розумієш концепції контейнеризації та відмінності від VM?',
        order: 3,
        options: [
          { label: 'Не розумію різниці', score: 1 },
          { label: 'Знаю що контейнери легші', score: 2 },
          { label: 'Namespace, cgroups, union filesystem', score: 3 },
          { label: 'Пояснюю trade-offs контейнерів vs VM', score: 4 },
          { label: 'Проєктую container strategy для продакшну', score: 5 },
        ],
      },
    ],
  },

  // ── REST API ─────────────────────────────────────────────────────────────────
  {
    skillSlug: 'rest',
    skillLabel: 'REST API',
    questions: [
      {
        text: 'Як добре знаєш HTTP-методи та їхню семантику?',
        order: 1,
        options: [
          { label: 'Знаю GET і POST', score: 1 },
          { label: 'GET, POST, PUT, DELETE', score: 2 },
          { label: 'PATCH, HEAD, OPTIONS + правильна семантика', score: 3 },
          { label: 'Idempotency, safe methods, кешування', score: 4 },
          { label: 'HTTP/2, content negotiation, HATEOAS', score: 5 },
        ],
      },
      {
        text: 'Який твій рівень проєктування RESTful ендпоїнтів?',
        order: 2,
        options: [
          { label: 'Довільні URL', score: 1 },
          { label: 'Іменую ресурси іменниками', score: 2 },
          { label: 'Версіонування, статус-коди, пагінація', score: 3 },
          { label: 'OpenAPI spec, HATEOAS, consistent error format', score: 4 },
          { label: 'API design guide для команди, deprecation strategy', score: 5 },
        ],
      },
      {
        text: 'Наскільки впевнено реалізуєш аутентифікацію та авторизацію в API?',
        order: 3,
        options: [
          { label: 'Без захисту', score: 1 },
          { label: 'Базова аутентифікація', score: 2 },
          { label: 'JWT токени, middleware', score: 3 },
          { label: 'Refresh tokens, RBAC, rate limiting', score: 4 },
          { label: 'OAuth2, PKCE, API security auditing', score: 5 },
        ],
      },
    ],
  },
]


const JS_JUNIOR_REPOS = [
  { name: 'javascript-exercises', url: 'https://github.com/TheOdinProject/javascript-exercises' },
  { name: 'You-Dont-Know-JS', url: 'https://github.com/getify/You-Dont-Know-JS' },
  { name: 'javascript-algorithms', url: 'https://github.com/trekhleb/javascript-algorithms' },
  { name: '30-seconds-of-code', url: 'https://github.com/Chalarangelo/30-seconds-of-code' },
  { name: 'clean-code-javascript', url: 'https://github.com/ryanmcdermott/clean-code-javascript' },
  { name: 'wtfjs', url: 'https://github.com/denysdovhan/wtfjs' },
  { name: 'js-the-right-way', url: 'https://github.com/braziljs/js-the-right-way' },
  { name: 'javascript-questions', url: 'https://github.com/lydiahallie/javascript-questions' },
  { name: 'es6-features', url: 'https://github.com/rse/es6-features' },
  { name: 'javascript-koans', url: 'https://github.com/mrdavidlaing/javascript-koans' },
  { name: 'learnjs', url: 'https://github.com/nicklockwood/learnjs' },
  { name: 'js-bits', url: 'https://github.com/vasanthk/js-bits' },
  { name: 'Functional-Light-JS', url: 'https://github.com/getify/Functional-Light-JS' },
  { name: 'JS-Cardio', url: 'https://github.com/bradtraversy/JS-Cardio' },
  { name: 'vanillawebprojects', url: 'https://github.com/bradtraversy/vanillawebprojects' },
  { name: 'javascript30', url: 'https://github.com/wesbos/JavaScript30' },
  { name: 'learnjavascript.online exercises', url: 'https://github.com/bobbyhadz/javascript-exercises' },
  { name: 'javascript-interview-questions', url: 'https://github.com/sudheerj/javascript-interview-questions' },
  { name: 'modern-js-cheatsheet', url: 'https://github.com/mbeaudru/modern-js-cheatsheet' },
  { name: 'freeCodeCamp', url: 'https://github.com/freeCodeCamp/freeCodeCamp' },
]

const JS_MIDDLE_REPOS = [
  ...JS_JUNIOR_REPOS,
  { name: 'node-best-practices', url: 'https://github.com/goldbergyoni/nodebestpractices' },
  { name: 'mostly-adequate-guide', url: 'https://github.com/MostlyAdequate/mostly-adequate-guide' },
  { name: 'ramda', url: 'https://github.com/ramda/ramda' },
  { name: 'rxjs', url: 'https://github.com/ReactiveX/rxjs' },
  { name: 'immer', url: 'https://github.com/immerjs/immer' },
  { name: 'lodash', url: 'https://github.com/lodash/lodash' },
  { name: 'jest', url: 'https://github.com/jestjs/jest' },
  { name: 'vitest', url: 'https://github.com/vitest-dev/vitest' },
  { name: 'webpack', url: 'https://github.com/webpack/webpack' },
  { name: 'vite', url: 'https://github.com/vitejs/vite' },
]

const TS_JUNIOR_REPOS = [
  { name: 'TypeScript', url: 'https://github.com/microsoft/TypeScript' },
  { name: 'typescript-book', url: 'https://github.com/basarat/typescript-book' },
  { name: 'type-challenges', url: 'https://github.com/type-challenges/type-challenges' },
  { name: 'clean-code-typescript', url: 'https://github.com/labs42io/clean-code-typescript' },
  { name: 'typescript-cheatsheets-react', url: 'https://github.com/typescript-cheatsheets/react' },
  { name: 'typescript-exercises', url: 'https://github.com/typescript-exercises/typescript-exercises' },
  { name: 'ts-jest', url: 'https://github.com/kulshekhar/ts-jest' },
  { name: 'zod', url: 'https://github.com/colinhacks/zod' },
  { name: 'io-ts', url: 'https://github.com/gcanti/io-ts' },
  { name: 'ts-toolbelt', url: 'https://github.com/millsp/ts-toolbelt' },
  { name: 'utility-types', url: 'https://github.com/piotrwitek/utility-types' },
  { name: 'typefest', url: 'https://github.com/sindresorhus/type-fest' },
  { name: 'typescript-starter', url: 'https://github.com/bitjson/typescript-starter' },
  { name: 'ts-pattern', url: 'https://github.com/gvergnaud/ts-pattern' },
  { name: 'effect', url: 'https://github.com/Effect-TS/effect' },
  { name: 'typeorm', url: 'https://github.com/typeorm/typeorm' },
  { name: 'prisma', url: 'https://github.com/prisma/prisma' },
  { name: 'nestjs', url: 'https://github.com/nestjs/nest' },
  { name: 'trpc', url: 'https://github.com/trpc/trpc' },
  { name: 'typescript-eslint', url: 'https://github.com/typescript-eslint/typescript-eslint' },
]

const TS_MIDDLE_REPOS = [
  ...TS_JUNIOR_REPOS,
  { name: 'total-typescript-book', url: 'https://github.com/total-typescript/total-typescript-book' },
  { name: 'type-fest', url: 'https://github.com/sindresorhus/type-fest' },
  { name: 'fp-ts', url: 'https://github.com/gcanti/fp-ts' },
  { name: 'hkt-toolbelt', url: 'https://github.com/nicolo-ribaudo/hkt-toolbelt' },
  { name: 'hotscript', url: 'https://github.com/gvergnaud/hotscript' },
  { name: 'tRPC examples', url: 'https://github.com/trpc/examples-next-prisma-starter' },
  { name: 'class-validator', url: 'https://github.com/typestack/class-validator' },
  { name: 'deepkit-framework', url: 'https://github.com/deepkit/deepkit-framework' },
  { name: 'kysely', url: 'https://github.com/kysely-org/kysely' },
  { name: 'drizzle-orm', url: 'https://github.com/drizzle-team/drizzle-orm' },
]

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱  Seeding database...')

  // ── Скіли + репо (js, ts) ──────────────────────────────────────────────────
  const js = await prisma.skill.upsert({
    where: { slug: 'js' },
    update: { label: 'JavaScript' },
    create: { slug: 'js', label: 'JavaScript' },
  })

  const ts = await prisma.skill.upsert({
    where: { slug: 'ts' },
    update: { label: 'TypeScript' },
    create: { slug: 'ts', label: 'TypeScript' },
  })

  // Видаляємо старі репо, щоб не дублювати при повторному seed
  await prisma.repo.deleteMany({ where: { skillId: { in: [js.id, ts.id] } } })

  await prisma.repo.createMany({
    data: JS_JUNIOR_REPOS.map((r) => ({ ...r, level: 'junior', skillId: js.id })),
  })
  await prisma.repo.createMany({
    data: JS_MIDDLE_REPOS.map((r) => ({ ...r, level: 'middle', skillId: js.id })),
  })
  await prisma.repo.createMany({
    data: TS_JUNIOR_REPOS.map((r) => ({ ...r, level: 'junior', skillId: ts.id })),
  })
  await prisma.repo.createMany({
    data: TS_MIDDLE_REPOS.map((r) => ({ ...r, level: 'middle', skillId: ts.id })),
  })

  console.log(`✅  Repos JS  → junior: ${JS_JUNIOR_REPOS.length}, middle: ${JS_MIDDLE_REPOS.length}`)
  console.log(`✅  Repos TS  → junior: ${TS_JUNIOR_REPOS.length}, middle: ${TS_MIDDLE_REPOS.length}`)

  // ── Квізи ─────────────────────────────────────────────────────────────────
  console.log('\n📝  Seeding quizzes...')

  for (const quiz of QUIZZES) {
    // upsert скіл (js і ts вже є, решта створюються)
    const skill = await prisma.skill.upsert({
      where: { slug: quiz.skillSlug },
      update: { label: quiz.skillLabel },
      create: { slug: quiz.skillSlug, label: quiz.skillLabel },
    })

    // Видаляємо старі питання цього скіла щоб не дублювати
    const oldQuestions = await prisma.question.findMany({
      where: { skillId: skill.id },
      select: { id: true },
    })
    if (oldQuestions.length > 0) {
      await prisma.questionOption.deleteMany({
        where: { questionId: { in: oldQuestions.map((q) => q.id) } },
      })
      await prisma.question.deleteMany({ where: { skillId: skill.id } })
    }

    // Створюємо питання з варіантами
    for (const q of quiz.questions) {
      await prisma.question.create({
        data: {
          text: q.text,
          order: q.order,
          skillId: skill.id,
          options: {
            create: q.options,
          },
        },
      })
    }

    const count = await prisma.question.count({ where: { skillId: skill.id } })
    console.log(`  ✅  ${quiz.skillLabel.padEnd(12)} → ${count} питань`)
  }

  console.log('\n🎉  Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
