// src/data/skillsData.ts

export type SkillId = 'js' | 'ts' | 'react' | 'python' | 'java' | 'node' | 'csharp' | 'cpp' | 'ai';

export interface Skill {
  id: SkillId;
  label: string;
}

export interface Option {
  label: string;
  score: number; // від 1 до 4
}

export interface Question {
  id: number;
  skill: SkillId;
  text: string;
  options: Option[];
}

export const SKILLS: Skill[] = [
  { id: 'js', label: 'JavaScript' },
  { id: 'ts', label: 'TypeScript' },
  { id: 'react', label: 'React' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'node', label: 'Node.js' },
  { id: 'csharp', label: 'C#' },
  { id: 'cpp', label: 'C++' },
  { id: 'ai', label: 'AI/ML' },
];

export const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    skill: 'js',
    text: 'Наскільки впевнено працюєте з замиканнями (closures)?',
    options: [
      { label: 'Лише чув(ла)', score: 1 },
      { label: 'Розумію теорію', score: 2 },
      { label: 'Використовую інколи', score: 3 },
      { label: 'Використовую регулярно', score: 4 },
    ],
  },
  {
    id: 2,
    skill: 'js',
    text: 'Як добре знаєте event loop та async/await?',
    options: [
      { label: 'Базовий рівень', score: 1 },
      { label: 'Розумію мікро/макротаски', score: 2 },
      { label: 'Дебажу race conditions', score: 3 },
      { label: 'Пишу складні async-потоки', score: 4 },
    ],
  },
  {
    id: 3,
    skill: 'ts',
    text: 'Наскільки впевнено працюєте з Generic-типами?',
    options: [
      { label: 'Майже не використовую', score: 1 },
      { label: 'Читаю, але рідко пишу', score: 2 },
      { label: 'Пишу generic функції/хуки', score: 3 },
      { label: 'Складні типи з infer та constraints', score: 4 },
    ],
  },
  { id: 4, skill: 'python', text: 'Робота з декораторами та контекстними менеджерами?', options: [{ label: 'Початківець', score: 1 }, { label: 'Профі', score: 4 }] },
  { id: 5, skill: 'java', text: 'Рівень розуміння JVM та Memory Management?', options: [{ label: 'Базовий', score: 1 }, { label: 'Глибокий', score: 4 }] },
  { id: 6, skill: 'node', text: 'Робота з Streams та Buffer?', options: [{ label: 'Не знаю', score: 1 }, { label: 'Працював', score: 4 }] },
  { id: 7, skill: 'csharp', text: 'Розуміння LINQ та async tasks?', options: [{ label: 'Базово', score: 1 }, { label: 'Впевнено', score: 4 }] },
  { id: 8, skill: 'cpp', text: 'Робота з вказівниками та Smart Pointers?', options: [{ label: 'Плутаюсь', score: 1 }, { label: 'Впевнено', score: 4 }] },
  { id: 9, skill: 'ai', text: 'Досвід з PyTorch або TensorFlow?', options: [{ label: 'Немає', score: 1 }, { label: 'Є проекти', score: 4 }] },
];