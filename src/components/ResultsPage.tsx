// src/components/ResultsPage.tsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { ROUTES } from '../routes';
import { SKILLS, QUIZ_QUESTIONS, type SkillId } from '../data/skillsData';
import './pageStyle/Results.css'

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Отримуємо дані з квізу
  const { answers, selectedSkillsIds } = (location.state as { 
    answers: Record<number, number>, 
    selectedSkillsIds: SkillId[] 
  }) || { answers: {}, selectedSkillsIds: [] };

  // Розрахунок результатів
  const stats = useMemo(() => {
    return selectedSkillsIds.map(skillId => {
      const skillQuestions = QUIZ_QUESTIONS.filter(q => q.skill === skillId);
      const maxPossibleScore = skillQuestions.length * 4; // max score за питання = 4
      const actualScore = skillQuestions.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
      const percentage = Math.round((actualScore / maxPossibleScore) * 100);
      
      const skillLabel = SKILLS.find(s => s.id === skillId)?.label || skillId;

      return { label: skillLabel, percentage, id: skillId };
    });
  }, [answers, selectedSkillsIds]);

  if (selectedSkillsIds.length === 0) {
    return <div className="p-10 text-center">Дані відсутні. <button onClick={() => navigate(ROUTES.START)}>Почати спочатку</button></div>;
  }

  return (
    <main className="min-h-screen bg-[#f8f9ff] p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-10 text-center">Ваш аналіз навичок</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Секція з діаграмами/статистикою */}
          <section className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <h2 className="text-2xl font-semibold mb-6">Рівень володіння</h2>
            <div className="space-y-8">
              {stats.map(s => (
                <div key={s.id}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-slate-700">{s.label}</span>
                    <span className="text-[#1363ff] font-bold">{s.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#1363ff] h-full transition-all duration-1000" 
                      style={{ width: `${s.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Секція Roadmap */}
          <section className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <h2 className="text-2xl font-semibold mb-6">Ваш персональний Roadmap</h2>
            <div className="space-y-4">
              {stats.map(s => (
                <div key={s.id} className="p-4 border border-slate-50 bg-slate-50/50 rounded-2xl">
                  <h3 className="font-bold text-slate-800 mb-2">Як підтягнути {s.label}?</h3>
                  <ul className="text-sm text-slate-600 space-y-2">
                    <li>• Ознайомтесь з документацією {s.label}</li>
                    <li>• <a href={`https://github.com/topics/${s.id}`} target="_blank" className="text-[#1363ff] hover:underline">Практичні репозиторії на GitHub</a></li>
                    {s.percentage < 50 && <li className="text-amber-600">• Рекомендовано пройти базовий курс</li>}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-12 text-center">
          <button 
            onClick={() => navigate(ROUTES.START)}
            className="px-10 py-4 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition"
          >
            Спробувати ще раз
          </button>
        </div>
      </div>
    </main>
  );
}