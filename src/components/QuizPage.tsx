// src/components/QuizPage.tsx
import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';
import { QUIZ_QUESTIONS, SKILLS, type SkillId } from '../data/skillsData';
import './pageStyle/Quiz.css'

export default function QuizPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Отримуємо скіли з StartPage
  const selectedSkillsIds = (location.state as { selectedSkills: SkillId[] })?.selectedSkills || [];

  // Фільтруємо питання для обраних стеків
  const activeQuestions = useMemo(() => {
    return QUIZ_QUESTIONS.filter((q) => selectedSkillsIds.includes(q.skill));
  }, [selectedSkillsIds]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const currentQuestion = activeQuestions[currentIndex];
  const isLastQuestion = currentIndex === activeQuestions.length - 1;

  const handleNext = () => {
    if (selectedOption === null) return;

    const newAnswers = { ...answers, [currentQuestion.id]: selectedOption };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // ПЕРЕДАЧА ДАНИХ: передаємо і відповіді, і вибрані ID для ResultsPage
      navigate(ROUTES.RESULTS, { state: { answers: newAnswers, selectedSkillsIds } });
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    }
  };

  if (activeQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button onClick={() => navigate(ROUTES.START)} className="text-[#1363ff] font-bold">
          ← Спочатку оберіть навички
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f1f1fb] flex flex-col items-center pt-12 px-4">
      <header className="mb-10 text-center">
        <h2 className="text-xl font-medium text-slate-800">SkillRoad</h2>
      </header>

      <h1 className="text-4xl md:text-5xl font-normal text-slate-900 mb-12">
        Питання: {currentIndex + 1}
      </h1>

      <div className="w-full max-w-4xl bg-gradient-to-b from-[#e8eaff] to-white rounded-[40px] shadow-sm p-10 md:p-20 flex flex-col items-center border border-white/50 relative overflow-hidden">
        {/* Фоновий декор (опціонально) */}
        <div className="absolute top-0 right-0 p-6 opacity-20 font-bold text-[#1363ff]">
          {SKILLS.find(s => s.id === currentQuestion.skill)?.label}
        </div>

        <h3 className="text-2xl md:text-3xl font-medium text-slate-900 text-center mb-16">
          [{currentQuestion.text}]
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 w-full mb-16">
          {currentQuestion.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedOption(opt.score)}
              className={`text-xl md:text-2xl transition-all text-center md:text-left py-3 px-6 rounded-2xl border ${
                selectedOption === opt.score 
                ? 'border-[#1363ff] text-[#1363ff] font-bold bg-[#1363ff]/5 scale-[1.02]' 
                : 'border-transparent text-slate-700 hover:bg-white/50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={selectedOption === null}
          className="bg-[#1363ff] text-white px-14 py-4 rounded-full text-lg font-semibold hover:bg-[#0051e6] transition shadow-lg disabled:bg-slate-300 disabled:shadow-none"
        >
          {isLastQuestion ? 'Завершити аналіз' : 'Аналізувати далі'}
        </button>
      </div>
    </main>
  );
}