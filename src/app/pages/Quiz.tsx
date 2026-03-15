import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import "../styles/Quiz.css";
import { fetchQuiz, submitResults, evaluateAnswer } from "../api";
import type { QuizSkill, QuizQuestion, QuizOption } from "../api";
import { ROLES } from "../data/skillsData";

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

// ─── Phase types ──────────────────────────────────────────────────────────────

type Phase = "mcq" | "openended" | "submitting";

// ─── Component ────────────────────────────────────────────────────────────────

export default function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();

  const roleId: string = location.state?.roleId ?? "";
  const roleLabel: string = location.state?.roleLabel ?? "Роль";
  const skillSlugs: string[] = location.state?.skillSlugs ?? [];

  // ── MCQ state ────────────────────────────────────────────────────────────
  const [flat, setFlat] = useState<FlatQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});

  // ── Open-ended state ──────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>("mcq");
  const [openAnswers, setOpenAnswers] = useState<string[]>(["", ""]);
  const [openCurrentIdx, setOpenCurrentIdx] = useState(0);
  const [evaluating, setEvaluating] = useState(false);

  // Open-ended questions from skillsData
  const role = ROLES.find((r) => r.id === roleId);
  const openEndedQuestions = role?.openEndedQuestions ?? [
    "Опиши свій підхід до вирішення складних технічних проблем.",
    "Як ти навчаєшся новим технологіям у своїй сфері?",
  ];

  // ── Load MCQ questions from API ──────────────────────────────────────────
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

  // ── MCQ Handlers ─────────────────────────────────────────────────────────
  const handleSelect = (optionId: string) => {
    setSelectedOptions((prev) => ({ ...prev, [currentIndex]: optionId }));
  };

  const handleMCQNext = () => {
    if (!selectedOptions[currentIndex]) return;

    if (currentIndex < flat.length - 1) {
      setCurrentIndex((i) => i + 1);
      return;
    }

    // MCQ done → move to open-ended phase
    setPhase("openended");
  };

  // ── Open-ended Handlers ───────────────────────────────────────────────────
  const handleOpenAnswerChange = (value: string) => {
    setOpenAnswers((prev) => {
      const next = [...prev];
      next[openCurrentIdx] = value;
      return next;
    });
  };

  const handleOpenNext = async () => {
    const answer = openAnswers[openCurrentIdx].trim();
    if (!answer) return;

    if (openCurrentIdx < openEndedQuestions.length - 1) {
      setOpenCurrentIdx((i) => i + 1);
      return;
    }

    // All open-ended answered → evaluate & submit
    setPhase("submitting");
    setEvaluating(true);

    try {
      // Evaluate all open answers in parallel
      const evals = await Promise.all(
        openEndedQuestions.map((q, i) =>
          evaluateAnswer(roleLabel, q, openAnswers[i] || "(без відповіді)")
        )
      );
      setEvaluating(false);

      const openAnswersPayload = openEndedQuestions.map((q, i) => ({
        question: q,
        answer: openAnswers[i] || "",
        score: evals[i]?.score ?? 0,
        feedback: evals[i]?.feedback ?? "",
      }));

      const skillResults = calcSkillResults(flat, selectedOptions);
      const roleScore = calcRoleScore(skillResults);
      const sessionId = getSessionId();

      let apiSkills: import("../api").SavedSkill[] | undefined = undefined;
      try {
        const response = await submitResults(sessionId, skillResults);
        apiSkills = response.skills;
      } catch {
        // non-critical, continue without DB data
      }

      navigate("/results", {
        state: {
          apiSkills,
          fallbackResults: skillResults,
          roleId,
          roleLabel,
          roleScore,
          openAnswers: openAnswersPayload,
        },
      });
    } catch {
      // AI failed — still go to results without AI data
      const skillResults = calcSkillResults(flat, selectedOptions);
      const roleScore = calcRoleScore(skillResults);
      navigate("/results", {
        state: {
          fallbackResults: skillResults,
          roleId,
          roleLabel,
          roleScore,
          openAnswers: [],
        },
      });
    } finally {
      setEvaluating(false);
    }
  };

  // ── Render: loading ───────────────────────────────────────────────────────
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

  // ── Render: submitting ────────────────────────────────────────────────────
  if (phase === "submitting") {
    return (
      <div className="quiz-container">
        <header className="header">SkillRoad</header>
        <div className="quiz-content">
          <p style={{ textAlign: "center", marginTop: "2rem" }}>
            {evaluating ? "🤖 AI аналізує твої відповіді…" : "Збереження…"}
          </p>
        </div>
      </div>
    );
  }

  // ── Render: open-ended phase ──────────────────────────────────────────────
  if (phase === "openended") {
    const currentQuestion = openEndedQuestions[openCurrentIdx];
    const currentAnswer = openAnswers[openCurrentIdx];
    const isLast = openCurrentIdx === openEndedQuestions.length - 1;

    return (
      <div className="quiz-container">
        <header className="header">SkillRoad</header>
        <div className="quiz-content">
          <div className="quiz-role-badge">{roleLabel}</div>

          <div className="open-ended-header">
            <span className="open-ended-phase-label">🤖 Відкриті питання</span>
            <span className="open-ended-counter">
              {openCurrentIdx + 1} / {openEndedQuestions.length}
            </span>
          </div>

          <div className="question-card open-ended-card">
            <h3 className="question-text">{currentQuestion}</h3>
            <textarea
              className="open-answer-textarea"
              placeholder="Введи свою відповідь…"
              value={currentAnswer}
              onChange={(e) => handleOpenAnswerChange(e.target.value)}
              rows={6}
            />
            <button
              className="next-button"
              onClick={handleOpenNext}
              disabled={!currentAnswer.trim()}
            >
              {isLast ? "Завершити та отримати результат" : "Наступне питання"}
            </button>
          </div>

          <div className="progress">
            Крок {openCurrentIdx + 1} з {openEndedQuestions.length}
          </div>
        </div>
      </div>
    );
  }

  // ── Render: MCQ phase ─────────────────────────────────────────────────────
  const { question, skillLabel } = flat[currentIndex];
  const chosen = selectedOptions[currentIndex];

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
            onClick={handleMCQNext}
            disabled={!chosen}
          >
            {currentIndex < flat.length - 1
              ? "Наступне питання"
              : "Перейти до відкритих питань →"}
          </button>
        </div>

        <div className="progress">
          {currentIndex + 1} з {flat.length}
        </div>
      </div>
    </div>
  );
}
