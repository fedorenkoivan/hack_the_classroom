/**
 * Seed script: наповнює БД скілами і репозиторіями.
 * Запуск: npm run seed
 *
 * JS  → 20 junior repos, 30 middle repos
 * TS  → 20 junior repos, 30 middle repos
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ─── Репозиторії ──────────────────────────────────────────────────────────────

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

  // Скіл: JavaScript
  const js = await prisma.skill.upsert({
    where: { slug: 'js' },
    update: { label: 'JavaScript' },
    create: { slug: 'js', label: 'JavaScript' },
  })

  // Скіл: TypeScript
  const ts = await prisma.skill.upsert({
    where: { slug: 'ts' },
    update: { label: 'TypeScript' },
    create: { slug: 'ts', label: 'TypeScript' },
  })

  // Видаляємо старі репо, щоб не дублювати при повторному seed
  await prisma.repo.deleteMany({ where: { skillId: { in: [js.id, ts.id] } } })

  // JS repos
  await prisma.repo.createMany({
    data: JS_JUNIOR_REPOS.map((r) => ({ ...r, level: 'junior', skillId: js.id })),
  })
  await prisma.repo.createMany({
    data: JS_MIDDLE_REPOS.map((r) => ({ ...r, level: 'middle', skillId: js.id })),
  })

  // TS repos
  await prisma.repo.createMany({
    data: TS_JUNIOR_REPOS.map((r) => ({ ...r, level: 'junior', skillId: ts.id })),
  })
  await prisma.repo.createMany({
    data: TS_MIDDLE_REPOS.map((r) => ({ ...r, level: 'middle', skillId: ts.id })),
  })

  const jsJunior = await prisma.repo.count({ where: { skillId: js.id, level: 'junior' } })
  const jsMiddle = await prisma.repo.count({ where: { skillId: js.id, level: 'middle' } })
  const tsJunior = await prisma.repo.count({ where: { skillId: ts.id, level: 'junior' } })
  const tsMiddle = await prisma.repo.count({ where: { skillId: ts.id, level: 'middle' } })

  console.log(`✅  JS  → junior: ${jsJunior}, middle: ${jsMiddle}`)
  console.log(`✅  TS  → junior: ${tsJunior}, middle: ${tsMiddle}`)
  console.log('🎉  Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
