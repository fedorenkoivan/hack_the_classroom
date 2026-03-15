import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import "../styles/Quiz.css";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const quizQuestions: Question[] = [
  {
    id: 1,
    question: "Що таке замикання (closure) в JavaScript?",
    options: [
      "Функція, яка має доступ до зовнішньої області видимості",
      "Метод закриття браузера",
      "Спосіб видалення змінних",
      "Тип циклу",
    ],
    correctAnswer: 0,
  },
  {
    id: 2,
    question: "Яка різниця між let та const?",
    options: [
      "const не можна переприсвоїти",
      "let працює швидше",
      "const використовується для чисел",
      "Немає різниці",
    ],
    correctAnswer: 0,
  },
  {
    id: 3,
    question: "Що робить хук useState в React?",
    options: [
      "Дозволяє використовувати стан в функціональних компонентах",
      "Перевіряє стан додатку",
      "Зберігає дані в localStorage",
      "Оновлює DOM напряму",
    ],
    correctAnswer: 0,
  },
  {
    id: 4,
    question: "Що таке Promise в JavaScript?",
    options: [
      "Об'єкт для роботи з асинхронними операціями",
      "Обіцянка виконати код",
      "Тип даних для чисел",
      "Метод масиву",
    ],
    correctAnswer: 0,
  },
  {
    id: 5,
    question: "Яка різниця між == та ===?",
    options: [
      "=== порівнює значення та тип",
      "== працює швидше",
      "=== використовується лише для чисел",
      "Немає різниці",
    ],
    correctAnswer: 0,
  },
];

export default function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const skills = location.state?.skills || [];
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);

  const handleNext = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers, selectedAnswer];
      setAnswers(newAnswers);

      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        // Завершити квіз і перейти до результатів
        navigate("/results", {
          state: {
            skills,
            answers: newAnswers,
            questions: quizQuestions,
          },
        });
      }
    }
  };

  const question = quizQuestions[currentQuestion];

  return (
    <div className="quiz-container">
      <header className="header">SkillRoad</header>

      <div className="quiz-content">
        <h2 className="question-title">
          Питання: {currentQuestion + 1}
        </h2>

        <div className="question-card">
          <h3 className="question-text">{question.question}</h3>

          <div className="options-grid">
            {question.options.map((option, index) => (
              <button
                key={index}
                className={`option-button ${
                  selectedAnswer === index ? "selected" : ""
                }`}
                onClick={() => setSelectedAnswer(index)}
              >
                {option}
              </button>
            ))}
          </div>

          <button
            className="next-button"
            onClick={handleNext}
            disabled={selectedAnswer === null}
          >
            {currentQuestion < quizQuestions.length - 1
              ? "Наступне питання"
              : "Завершити"}
          </button>
        </div>

        <div className="progress">
          {currentQuestion + 1} з {quizQuestions.length}
        </div>
      </div>
    </div>
  );
}