import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import "../styles/Quiz.css";
import { fetchQuiz, submitResults } from "../api";
import type { QuizSkill, QuizQuestion, QuizOption } from "../api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSessionId(): string {
  let id = sessionStorage.getItem("sessionId");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("sessionId", id);
  }
  return id;
}

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
  selectedOptions: Record<number, string>
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

/** Зважений середній score по всіх скілах ролі */
function calcRoleScore(results: { score: number }[]): number {
  if (results.length === 0) return 0;
  return Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();

  // Тепер з Home приходять: roleId, roleLabel, skillSlugs[]
  const roleId: string = location.state?.roleId ?? "";
  const roleLabel: string = location.state?.roleLabel ?? "Роль";
  const skillSlugs: string[] = location.state?.skillSlugs ?? [];

  const [flat, setFlat] = useState<FlatQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});

  // ── Load questions from API ──────────────────────────────────────────────
  useEffect(() => {
    fetchQuiz(skillSlugs.length > 0 ? skillSlugs : undefined)
      .then((skills) => {
        const filtered = skillSlugs.length > 0
          ? skills.filter((s) => skillSlugs.includes(s.slug))
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
      const skillResults = calcSkillResults(flat, selectedOptions);
      const roleScore = calcRoleScore(skillResults);
      const sessionId = getSessionId();
      const response = await submitResults(sessionId, skillResults);

      navigate("/results", {
        state: {
          apiSkills: response.skills,
          roleId,
          roleLabel,
          roleScore,
        },
      });
    } catch {
      const skillResults = calcSkillResults(flat, selectedOptions);
      const roleScore = calcRoleScore(skillResults);
      navigate("/results", {
        state: {
          fallbackResults: skillResults,
          roleId,
          roleLabel,
          roleScore,
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
            {error ?? "Питань не знайдено для цієї ролі."}
          </p>
        </div>
      </div>
    );
  }

  const { question, skillLabel } = flat[currentIndex];
  const chosen = selectedOptions[currentIndex];

  // Прогрес по скілах
  const skillProgress = skillSlugs.map((slug) => {
    const questions = flat.filter((f) => f.skillSlug === slug);
    const answered = questions.filter((_, i) => {
      const globalIdx = flat.indexOf(questions[i] ?? questions[0]);
      return selectedOptions[globalIdx] !== undefined;
    }).length;
    return { slug, total: questions.length, answered };
  });

  return (
    <div className="quiz-container">
      <header className="header">SkillRoad</header>

      <div className="quiz-content">
        <div className="quiz-role-badge">{roleLabel}</div>

        <h2 className="question-title">
          {skillLabel} — {currentIndex + 1} / {flat.length}
        </h2>

        <div className="skill-progress-bar">
          {skillProgress.map((sp) => (
            <div key={sp.slug} className="skill-progress-segment" title={sp.slug}>
              <span className="skill-progress-label">{sp.slug}</span>
              <div className="skill-progress-track">
                <div
                  className="skill-progress-fill"
                  style={{ width: `${sp.total > 0 ? (sp.answered / sp.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="question-card">
          <h3 className="question-text">{question.text}</h3>

          <div className="options-grid">
            {question.options.map((option: QuizOption) => (
              <button
                key={option.id}
                className={`option-button ${chosen === option.id ? "selected" : ""}`}
                onClick={() => handleSelect(option.id)}
              >
                {option.label}
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
              : "Завершити квіз"}
          </button>
        </div>

        <div className="progress">
          {currentIndex + 1} з {flat.length}
        </div>
      </div>
    </div>
  );
}