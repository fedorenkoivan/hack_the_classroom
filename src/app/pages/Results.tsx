import { useLocation } from "react-router";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import "../styles/Results.css";
import type { SavedSkill } from "../api";

interface SkillData {
  skill: string;
  level: number;
  levelLabel: string;
  repos: { name: string; url: string }[];
}

const githubRepos: { [key: string]: { name: string; url: string }[] } = {
  JavaScript: [
    { name: "javascript-algorithms", url: "https://github.com/trekhleb/javascript-algorithms" },
    { name: "33-js-concepts", url: "https://github.com/leonardomso/33-js-concepts" },
    { name: "clean-code-javascript", url: "https://github.com/ryanmcdermott/clean-code-javascript" },
    { name: "You-Dont-Know-JS", url: "https://github.com/getify/You-Dont-Know-JS" },
    { name: "airbnb-javascript", url: "https://github.com/airbnb/javascript" },
    { name: "awesome-javascript", url: "https://github.com/sorrycc/awesome-javascript" },
    { name: "es6-features", url: "https://github.com/lukehoban/es6features" },
    { name: "javascript-questions", url: "https://github.com/lydiahallie/javascript-questions" },
    { name: "wtfjs", url: "https://github.com/denysdovhan/wtfjs" },
    { name: "30-seconds-of-code", url: "https://github.com/30-seconds/30-seconds-of-code" },
  ],
  TypeScript: [
    { name: "TypeScript", url: "https://github.com/microsoft/TypeScript" },
    { name: "type-challenges", url: "https://github.com/type-challenges/type-challenges" },
    { name: "typescript-book", url: "https://github.com/basarat/typescript-book" },
    { name: "typescript-cheatsheets", url: "https://github.com/typescript-cheatsheets/react" },
    { name: "awesome-typescript", url: "https://github.com/dzharii/awesome-typescript" },
    { name: "utility-types", url: "https://github.com/piotrwitek/utility-types" },
    { name: "ts-node", url: "https://github.com/TypeStrong/ts-node" },
    { name: "definitely-typed", url: "https://github.com/DefinitelyTyped/DefinitelyTyped" },
    { name: "typescript-eslint", url: "https://github.com/typescript-eslint/typescript-eslint" },
    { name: "tsconfig-paths", url: "https://github.com/dividab/tsconfig-paths" },
  ],
  React: [
    { name: "react", url: "https://github.com/facebook/react" },
    { name: "react-use", url: "https://github.com/streamich/react-use" },
    { name: "awesome-react", url: "https://github.com/enaqx/awesome-react" },
    { name: "react-patterns", url: "https://github.com/chantastic/reactpatterns.com" },
    { name: "react-redux", url: "https://github.com/reduxjs/react-redux" },
    { name: "next.js", url: "https://github.com/vercel/next.js" },
    { name: "react-router", url: "https://github.com/remix-run/react-router" },
    { name: "react-query", url: "https://github.com/TanStack/query" },
    { name: "zustand", url: "https://github.com/pmndrs/zustand" },
    { name: "react-hook-form", url: "https://github.com/react-hook-form/react-hook-form" },
  ],
  "Node.js": [
    { name: "node", url: "https://github.com/nodejs/node" },
    { name: "express", url: "https://github.com/expressjs/express" },
    { name: "awesome-nodejs", url: "https://github.com/sindresorhus/awesome-nodejs" },
    { name: "nestjs", url: "https://github.com/nestjs/nest" },
    { name: "fastify", url: "https://github.com/fastify/fastify" },
    { name: "nodebestpractices", url: "https://github.com/goldbergyoni/nodebestpractices" },
    { name: "prisma", url: "https://github.com/prisma/prisma" },
    { name: "socket.io", url: "https://github.com/socketio/socket.io" },
    { name: "pm2", url: "https://github.com/Unitech/pm2" },
    { name: "node-postgres", url: "https://github.com/brianc/node-postgres" },
  ],
  Python: [
    { name: "python-guide", url: "https://github.com/realpython/python-guide" },
    { name: "awesome-python", url: "https://github.com/vinta/awesome-python" },
    { name: "django", url: "https://github.com/django/django" },
    { name: "flask", url: "https://github.com/pallets/flask" },
    { name: "fastapi", url: "https://github.com/tiangolo/fastapi" },
    { name: "pandas", url: "https://github.com/pandas-dev/pandas" },
    { name: "numpy", url: "https://github.com/numpy/numpy" },
    { name: "scikit-learn", url: "https://github.com/scikit-learn/scikit-learn" },
    { name: "tensorflow", url: "https://github.com/tensorflow/tensorflow" },
    { name: "pytorch", url: "https://github.com/pytorch/pytorch" },
  ],
  Java: [
    { name: "java-design-patterns", url: "https://github.com/iluwatar/java-design-patterns" },
    { name: "awesome-java", url: "https://github.com/akullpp/awesome-java" },
    { name: "spring-boot", url: "https://github.com/spring-projects/spring-boot" },
    { name: "spring-framework", url: "https://github.com/spring-projects/spring-framework" },
    { name: "guava", url: "https://github.com/google/guava" },
    { name: "RxJava", url: "https://github.com/ReactiveX/RxJava" },
    { name: "hibernate-orm", url: "https://github.com/hibernate/hibernate-orm" },
    { name: "tutorials", url: "https://github.com/eugenp/tutorials" },
    { name: "interviews", url: "https://github.com/kdn251/interviews" },
    { name: "effective-java", url: "https://github.com/jbloch/effective-java-3e-source-code" },
  ],
  "C++": [
    { name: "awesome-cpp", url: "https://github.com/fffaraz/awesome-cpp" },
    { name: "cpp-best-practices", url: "https://github.com/cpp-best-practices/cppbestpractices" },
    { name: "modern-cpp-features", url: "https://github.com/AnthonyCalandra/modern-cpp-features" },
    { name: "googletest", url: "https://github.com/google/googletest" },
    { name: "boost", url: "https://github.com/boostorg/boost" },
    { name: "opencv", url: "https://github.com/opencv/opencv" },
    { name: "fmt", url: "https://github.com/fmtlib/fmt" },
    { name: "algorithms", url: "https://github.com/TheAlgorithms/C-Plus-Plus" },
    { name: "folly", url: "https://github.com/facebook/folly" },
    { name: "vcpkg", url: "https://github.com/microsoft/vcpkg" },
  ],
  "HTML/CSS": [
    { name: "css-tricks", url: "https://github.com/AllThingsSmitty/css-protips" },
    { name: "awesome-css", url: "https://github.com/awesome-css-group/awesome-css" },
    { name: "animate.css", url: "https://github.com/animate-css/animate.css" },
    { name: "tailwindcss", url: "https://github.com/tailwindlabs/tailwindcss" },
    { name: "normalize.css", url: "https://github.com/necolas/normalize.css" },
    { name: "bootstrap", url: "https://github.com/twbs/bootstrap" },
    { name: "pure-css", url: "https://github.com/pure-css/pure" },
    { name: "html5-boilerplate", url: "https://github.com/h5bp/html5-boilerplate" },
    { name: "css-reference", url: "https://github.com/jgthms/css-reference" },
    { name: "flexbox-guide", url: "https://github.com/samanthaming/Flexbox30" },
  ],
  SQL: [
    { name: "awesome-sql", url: "https://github.com/danhuss/awesome-sql" },
    { name: "sql-practice", url: "https://github.com/WebDevSimplified/Learn-SQL" },
    { name: "postgresql", url: "https://github.com/postgres/postgres" },
    { name: "mysql-server", url: "https://github.com/mysql/mysql-server" },
    { name: "sql-style-guide", url: "https://github.com/mattm/sql-style-guide" },
    { name: "sql-masterclass", url: "https://github.com/DataWithDanny/sql-masterclass" },
    { name: "sequelize", url: "https://github.com/sequelize/sequelize" },
    { name: "typeorm", url: "https://github.com/typeorm/typeorm" },
    { name: "knex", url: "https://github.com/knex/knex" },
    { name: "sql-questions", url: "https://github.com/kansiris/SQL-interview-questions" },
  ],
  Git: [
    { name: "git", url: "https://github.com/git/git" },
    { name: "gitignore", url: "https://github.com/github/gitignore" },
    { name: "learn-git-branching", url: "https://github.com/pcottle/learnGitBranching" },
    { name: "git-tips", url: "https://github.com/git-tips/tips" },
    { name: "git-flight-rules", url: "https://github.com/k88hudson/git-flight-rules" },
    { name: "awesome-git", url: "https://github.com/dictcp/awesome-git" },
    { name: "git-cheat-sheet", url: "https://github.com/arslanbilal/git-cheat-sheet" },
    { name: "git-extras", url: "https://github.com/tj/git-extras" },
    { name: "husky", url: "https://github.com/typicode/husky" },
    { name: "conventional-commits", url: "https://github.com/conventional-commits/conventionalcommits.org" },
  ],
};

// ─── level helpers ────────────────────────────────────────────────────────────

function levelLabel(level: string): string {
  if (level === "Junior") return "Початковий рівень";
  if (level === "Middle") return "Середній рівень";
  return "Просунутий рівень";
}

function levelValue(level: string): number {
  if (level === "Junior") return 2;
  if (level === "Middle") return 3;
  return 5;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Results() {
  const location = useLocation();

  /**
   * apiSkills — масив SavedSkill з бекенду (є коли submit пройшов успішно)
   * fallbackResults — масив {skillSlug, score, level} коли бек недоступний
   * skillLabels — лейбли навичок з Home (для fallback відображення)
   */
  const {
    apiSkills,
    fallbackResults,
    skillLabels = [],
  } = (location.state ?? {}) as {
    apiSkills?: SavedSkill[];
    fallbackResults?: { skillSlug: string; score: number; level: string }[];
    skillLabels?: string[];
  };

  let skillsData: SkillData[] = [];

  if (apiSkills && apiSkills.length > 0) {
    // ── Дані з бекенду ──────────────────────────────────────────────────────
    skillsData = apiSkills.map((s) => ({
      skill: s.label,
      level: levelValue(s.level),
      levelLabel: levelLabel(s.level),
      repos: s.repos,
    }));
  } else if (fallbackResults && fallbackResults.length > 0) {
    // ── Fallback: бек недоступний, показуємо хардкод-репки ─────────────────
    skillsData = fallbackResults.map((r) => ({
      skill: skillLabels.find((l) => l.toLowerCase().replace(/[^a-z]/g, "") === r.skillSlug) ?? r.skillSlug,
      level: levelValue(r.level),
      levelLabel: levelLabel(r.level),
      repos: githubRepos[r.skillSlug] ?? [],
    }));
  }

  // Дані для радарної діаграми
  const radarData = skillsData.map((item) => ({
    skill: item.skill,
    value: item.level,
  }));

  return (
    <div className="results-container">
      <header className="header">SkillRoad</header>

      <div className="results-content">
        <h1 className="results-title">Аналіз ваших навичок</h1>

        <div className="radar-section">
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#c7d2fe" />
              <PolarAngleAxis 
                dataKey="skill" 
                tick={{ fill: '#1f2937', fontSize: 14, fontWeight: 500 }}
              />
              <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: '#6b7280' }} />
              <Radar
                name="Рівень"
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="roadmap-section">
          <h2 className="roadmap-title">Ваш навчальний Roadmap</h2>
          <div className="roadmap-timeline">
            {skillsData.map((skillData, index) => (
              <SkillRoadmap key={index} data={skillData} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkillRoadmap({ data }: { data: SkillData }) {
  const [expanded, setExpanded] = useState(false);

  const visibleRepos = expanded ? data.repos : data.repos.slice(0, 3);

  return (
    <div className="skill-item">
      <div className="skill-header">
        <div className="skill-dot"></div>
        <div className="skill-info">
          <h3 className="skill-name">{data.skill}</h3>
          <p className="skill-level">{data.levelLabel}</p>
        </div>
      </div>

      <div className="repos-list">
        {visibleRepos.map((repo, index) => (
          <a
            key={index}
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="repo-link"
          >
            {repo.name}
          </a>
        ))}

        {data.repos.length > 3 && (
          <button className="expand-button" onClick={() => setExpanded(!expanded)}>
            {expanded ? (
              <>
                <ChevronUp size={16} />
                Згорнути
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Показати ще {data.repos.length - 3}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
