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
}

export const ROLES: Role[] = [
  {
    id: 'frontend',
    label: 'Frontend Engineer',
    description: 'UI, браузер, доступність та перформанс',
    icon: '🖥️',
    skillSlugs: ['js', 'ts', 'react', 'css'],
  },
  {
    id: 'backend',
    label: 'Backend Engineer',
    description: 'Серверна логіка, API, бази даних',
    icon: '⚙️',
    skillSlugs: ['nodejs', 'python', 'sql', 'rest'],
  },
  {
    id: 'fullstack',
    label: 'Fullstack Engineer',
    description: 'Фронт + бек, end-to-end розробка',
    icon: '🔗',
    skillSlugs: ['js', 'ts', 'react', 'nodejs', 'sql'],
  },
  {
    id: 'devops',
    label: 'DevOps / Platform Engineer',
    description: 'CI/CD, контейнери, інфраструктура',
    icon: '🚀',
    skillSlugs: ['docker', 'git', 'rest', 'python'],
  },
  {
    id: 'mobile',
    label: 'Mobile Engineer',
    description: 'iOS / Android / Cross-platform додатки',
    icon: '📱',
    skillSlugs: ['js', 'ts', 'react'],
  },
  {
    id: 'data',
    label: 'Data Engineer',
    description: 'Пайплайни даних, ETL, склади даних',
    icon: '📊',
    skillSlugs: ['python', 'sql', 'git'],
  },
  {
    id: 'ml',
    label: 'ML / AI Engineer',
    description: 'Машинне навчання, моделі, інференс',
    icon: '🤖',
    skillSlugs: ['python', 'sql'],
  },
  {
    id: 'qa',
    label: 'QA / Test Engineer',
    description: 'Автоматизація тестування, якість продукту',
    icon: '🧪',
    skillSlugs: ['js', 'python', 'git', 'rest'],
  },
  {
    id: 'security',
    label: 'Security Engineer',
    description: 'AppSec, пентест, захист інфраструктури',
    icon: '🔐',
    skillSlugs: ['python', 'rest', 'docker', 'git'],
  },
  {
    id: 'embedded',
    label: 'Embedded / Systems Engineer',
    description: 'Низькорівневе програмування, мікроконтролери',
    icon: '🔧',
    skillSlugs: ['git', 'docker'],
  },
];
