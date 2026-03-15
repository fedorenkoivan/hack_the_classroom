// src/data/skillsData.ts

export type RoleId =
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'devops'
  | 'mobile'
  | 'data'
  | 'ml'
  | 'qa'
  | 'security'
  | 'embedded';

export interface Role {
  id: RoleId;
  label: string;
  description: string;
  icon: string;
  /** slugи скілів у БД, що входять до цієї ролі */
  skillSlugs: string[];
  /** 2 відкритих питання для AI-оцінки */
  openEndedQuestions: [string, string];
}

export const ROLES: Role[] = [
  {
    id: 'frontend',
    label: 'Frontend Engineer',
    description: 'UI, браузер, доступність та перформанс',
    icon: '🖥️',
    skillSlugs: ['js', 'ts', 'react', 'css'],
    openEndedQuestions: [
      'Як би ти оптимізував Core Web Vitals (LCP, CLS, FID) у повільному React-додатку?',
      'Поясни різницю між CSS-in-JS та utility-first CSS (Tailwind). Коли обираєш кожен підхід?',
    ],
  },
  {
    id: 'backend',
    label: 'Backend Engineer',
    description: 'Серверна логіка, API, бази даних',
    icon: '⚙️',
    skillSlugs: ['nodejs', 'python', 'sql', 'rest'],
    openEndedQuestions: [
      'Як би ти спроектував масштабований REST API для сервісу з мільйоном запитів на день?',
      'Поясни різницю між SQL-індексом B-tree та Hash. Коли кожен краще підходить?',
    ],
  },
  {
    id: 'fullstack',
    label: 'Fullstack Engineer',
    description: 'Фронт + бек, end-to-end розробка',
    icon: '🔗',
    skillSlugs: ['js', 'ts', 'react', 'nodejs', 'sql'],
    openEndedQuestions: [
      'Як би ти реалізував real-time синхронізацію між клієнтом і сервером у fullstack-додатку?',
      'Опиши свій підхід до управління станом у великому React + Node.js проєкті.',
    ],
  },
  {
    id: 'devops',
    label: 'DevOps / Platform Engineer',
    description: 'CI/CD, контейнери, інфраструктура',
    icon: '🚀',
    skillSlugs: ['docker', 'git', 'rest', 'python'],
    openEndedQuestions: [
      'Як би ти побудував CI/CD пайплайн для команди з 10 розробників? Опиши кроки.',
      'Поясни різницю між Docker image та container. Як оптимізуєш розмір образу?',
    ],
  },
  {
    id: 'mobile',
    label: 'Mobile Engineer',
    description: 'iOS / Android / Cross-platform додатки',
    icon: '📱',
    skillSlugs: ['js', 'ts', 'react'],
    openEndedQuestions: [
      'Як би ти вирішив проблему перформансу в React Native списку з тисячами елементів?',
      'Порівняй нативну розробку (Swift/Kotlin) з cross-platform (React Native/Flutter). Коли обираєш кожен підхід?',
    ],
  },
  {
    id: 'data',
    label: 'Data Engineer',
    description: 'Пайплайни даних, ETL, склади даних',
    icon: '📊',
    skillSlugs: ['python', 'sql', 'git'],
    openEndedQuestions: [
      'Як би ти спроектував ETL-пайплайн для обробки 100 ГБ даних на день?',
      'Поясни різницю між Data Warehouse та Data Lake. Коли обираєш кожен?',
    ],
  },
  {
    id: 'ml',
    label: 'ML / AI Engineer',
    description: 'Машинне навчання, моделі, інференс',
    icon: '🤖',
    skillSlugs: ['python', 'sql'],
    openEndedQuestions: [
      'Як би ти боровся з проблемою overfitting у моделі машинного навчання?',
      'Опиши процес деплою ML-моделі у продакшн. Які виклики найчастіше виникають?',
    ],
  },
  {
    id: 'qa',
    label: 'QA / Test Engineer',
    description: 'Автоматизація тестування, якість продукту',
    icon: '🧪',
    skillSlugs: ['js', 'python', 'git', 'rest'],
    openEndedQuestions: [
      'Як би ти збудував стратегію тестування для нового веб-додатку з нуля?',
      'Опиши різницю між unit, integration та e2e тестами. Яке співвідношення вважаєш оптимальним?',
    ],
  },
  {
    id: 'security',
    label: 'Security Engineer',
    description: 'AppSec, пентест, захист інфраструктури',
    icon: '🔐',
    skillSlugs: ['python', 'rest', 'docker', 'git'],
    openEndedQuestions: [
      'Як би ти перевірив REST API на вразливості OWASP Top 10? Опиши свій процес.',
      'Поясни принцип least privilege і наведи приклад його застосування в хмарній інфраструктурі.',
    ],
  },
  {
    id: 'embedded',
    label: 'Embedded / Systems Engineer',
    description: 'Низькорівневе програмування, мікроконтролери',
    icon: '🔧',
    skillSlugs: ['git', 'docker'],
    openEndedQuestions: [
      'Як би ти відлагоджував проблему race condition у embedded-системі реального часу?',
      'Поясни різницю між stack та heap пам\'яттю і чому це критично для мікроконтролерів.',
    ],
  },
];
