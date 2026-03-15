import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import "../styles/Quiz.css";
import { fetchQuiz, submitResults } from "../api";
import type { QuizSkill, QuizQuestion, QuizOption } from "../api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Унікальний ID сесії браузера — зберігаємо в sessionStorage */
function getSessionId(): string {
  let id = sessionStorage.getItem("sessionId");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("sessionId", id);
  }
  return id;
}

/**
 * Skill slug mapping: лейбли з Home → slug у БД
 * (Home передає лейбли типу "JavaScript", бек очікує "js")
 */
const LABEL_TO_SLUG: Record<string, string> = {
  JavaScript: "js",
  TypeScript: "ts",
  React: "react",
  "Node.js": "nodejs",
  Python: "python",
  Java: "java",
  "C++": "cpp",
  "HTML/CSS": "htmlcss",
  SQL: "sql",
  Git: "git",
};

// ─── Flat list of questions from all skills ───────────────────────────────────

interface FlatQuestion {
  skillSlug: string;
  skillLabel: string;
  question: QuizQuestion;
}

function flattenQuestions(skills: QuizSkill[]): FlatQuestion[] {
  return skills.flatMap((skill) =>
    skill.questions.map((q) => ({
      skillSlug: skill.slug,
      skillLabel: skill.label,
      question: q,
    }))
  );
}

// ─── Score calculation ────────────────────────────────────────────────────────

function calcSkillResults(
  flat: FlatQuestion[],
  selectedOptions: Record<number, string> // index → optionId
): { skillSlug: string; score: number; level: string }[] {
  const bySkill: Record<string, { total: number; sum: number }> = {};

  flat.forEach((item, index) => {
    const slug = item.skillSlug;
    if (!bySkill[slug]) bySkill[slug] = { total: 0, sum: 0 };

    const chosenOptionId = selectedOptions[index];
    const chosenOption = item.question.options.find((o) => o.id === chosenOptionId);
    const maxScore = Math.max(...item.question.options.map((o) => o.score));

    bySkill[slug].total += maxScore || 1;
    bySkill[slug].sum += chosenOption?.score ?? 0;
  });

  return Object.entries(bySkill).map(([skillSlug, { total, sum }]) => {
    const score = total > 0 ? Math.round((sum / total) * 100) : 0;
    const level =
      score >= 70 ? "Strong Middle" : score >= 40 ? "Middle" : "Junior";
    return { skillSlug, score, level };
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();

  // skills — масив лейблів з Home ("JavaScript", "React", …)
  const selectedLabels: string[] = location.state?.skills ?? [];

  const [flat, setFlat] = useState<FlatQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});

  // ── Load questions from API ──────────────────────────────────────────────
  useEffect(() => {
    const slugs = selectedLabels
      .map((l) => LABEL_TO_SLUG[l])
      .filter(Boolean);

    fetchQuiz(slugs.length > 0 ? slugs : undefined)
      .then((skills) => {
        // Якщо немає slugs у БД — зберігаємо всі скіли
        const filtered =
          slugs.length > 0
            ? skills.filter((s) => slugs.includes(s.slug))
            : skills;
        setFlat(flattenQuestions(filtered));
        setLoading(false);
      })
      .catch(() => {
        setError("Не вдалося завантажити питання. Перевір чи запущений бекенд.");
        setLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleSelect = (optionId: string) => {
    setSelectedOptions((prev) => ({ ...prev, [currentIndex]: optionId }));
  };

  const handleNext = async () => {
    if (!selectedOptions[currentIndex]) return;

    if (currentIndex < flat.length - 1) {
      setCurrentIndex((i) => i + 1);
      return;
    }

    // ── Last question → submit ─────────────────────────────────────────────
    setSubmitting(true);
    try {
      const results = calcSkillResults(flat, selectedOptions);
      const sessionId = getSessionId();
      const response = await submitResults(sessionId, results);

      navigate("/results", { state: { apiSkills: response.skills } });
    } catch {
      // Якщо бекенд недоступний — переходимо без даних з API
      const results = calcSkillResults(flat, selectedOptions);
      navigate("/results", {
        state: {
          fallbackResults: results,
          skillLabels: selectedLabels,
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render states ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="quiz-container">
        <header className="header">SkillRoad</header>
        <div className="quiz-content">
          <p style={{ textAlign: "center", marginTop: "2rem" }}>
            Завантаження питань…
          </p>
        </div>
      </div>
    );
  }

  if (error || flat.length === 0) {
    return (
      <div className="quiz-container">
        <header className="header">SkillRoad</header>
        <div className="quiz-content">
          <p style={{ textAlign: "center", marginTop: "2rem", color: "red" }}>
            {error ?? "Питань не знайдено для вибраних навичок."}
          </p>
        </div>
      </div>
    );
  }

  const { question, skillLabel } = flat[currentIndex];
  const chosen = selectedOptions[currentIndex];

  return (
    <div className="quiz-container">
      <header className="header">SkillRoad</header>

      <div className="quiz-content">
        <h2 className="question-title">
          {skillLabel} — Питання {currentIndex + 1}
        </h2>

        <div className="question-card">
          <h3 className="question-text">{question.text}</h3>

          <div className="options-grid">
            {question.options.map((option: QuizOption) => (
              <button
                key={option.id}
                className={`option-button ${chosen === option.id ? "selected" : ""}`}
                onClick={() => handleSelect(option.id)}
              >
                {option.text}
              </button>
            ))}
          </div>

          <button
            className="next-button"
            onClick={handleNext}
            disabled={!chosen || submitting}
          >
            {submitting
              ? "Збереження…"
              : currentIndex < flat.length - 1
              ? "Наступне питання"
              : "Завершити"}
          </button>
        </div>

        <div className="progress">
          {currentIndex + 1} з {flat.length}
        </div>
      </div>
    </div>
  );
}