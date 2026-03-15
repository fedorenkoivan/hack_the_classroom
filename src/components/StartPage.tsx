// src/components/StartPage.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SKILLS, type SkillId } from '../data/skillsData'
import './pageStyle/Home.css'

export default function StartPage() {
  const navigate = useNavigate()
  const [isSkillListOpen, setIsSkillListOpen] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<SkillId[]>([])

  const toggleSkill = (skillId: SkillId) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId]
    )
  }

  // При натисканні на "Аналізувати" переходимо на /quiz, передаючи вибрані скіли
  const handleAnalyze = () => {
    if (selectedSkills.length > 0) {
      navigate('/quiz', { state: { selectedSkills } })
    }
  }

  return (
    <main className="min-h-screen bg-white relative">
      {/* М'який фіолетовий градієнт угорі */}
      <div className="absolute top-0 left-0 right-0 h-60 bg-[radial-gradient(circle_at_top,#e6daff_0%,#ffffff_100%)] z-0"></div>

      <div className="container mx-auto max-w-5xl px-4 py-20 relative z-10 flex flex-col items-center">
        {/* Заголовки (точно як на референсі) */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-slate-700 tracking-wide">SkillRoad</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight max-w-2xl mx-auto">
            Заповни прогалини в знаннях. Отримай роботу мрії.
          </h1>
          <p className="mt-6 text-base md:text-lg text-slate-600 max-w-xl mx-auto">
            Не вчи зайвого. Знай, що насправді шукає ринок.
          </p>
        </div>

        {/* Область введення/вибору навичок та кнопка */}
        <div className="w-full max-w-2xl relative">
          <div className="flex items-center">
            {/* Поле, що імітує dropdown */}
            <div
              className={`relative flex-grow flex items-center border border-slate-200 rounded-full h-14 px-5 shadow-sm bg-white cursor-pointer hover:border-[#b599ff] transition-colors ${
                isSkillListOpen ? 'border-[#b599ff] ring-2 ring-[#b599ff]/20' : ''
              }`}
              onClick={() => setIsSkillListOpen(!isSkillListOpen)}
            >
              {/* Іконка лупи */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-400 mr-3"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>

              {/* Текст плейсхолдера або вибраних навичок */}
              <span className={`text-slate-600 ${selectedSkills.length > 0 ? 'text-slate-900 font-medium' : ''}`}>
                {selectedSkills.length === 0
                  ? 'Оберіть ваші навички'
                  : `${SKILLS.filter(s => selectedSkills.includes(s.id)).map(s => s.label).join(', ')}`}
              </span>

              {/* Стрілочка */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-slate-400 ml-auto transform transition ${isSkillListOpen ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            {/* Синя кнопка "Аналізувати" */}
            <button
              onClick={handleAnalyze}
              disabled={selectedSkills.length === 0}
              className="h-14 px-10 ml-4 bg-[#1363ff] text-white font-semibold rounded-full hover:bg-[#0051e6] transition disabled:bg-slate-300 disabled:cursor-not-allowed text-lg shadow"
            >
              Аналізувати
            </button>
          </div>

          {/* Випадаючий список навичок */}
          {isSkillListOpen && (
            <div className="absolute top-16 left-0 right-0 p-5 border border-slate-200 rounded-3xl bg-white shadow-xl z-20">
              <h3 className="text-xl font-bold mb-5 text-slate-800">Технічні стеки</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
                {SKILLS.map((skill) => {
                  const isSelected = selectedSkills.includes(skill.id)
                  return (
                    <label
                      key={skill.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 hover:border-[#b599ff] hover:bg-[#f6f2ff] transition ${
                        isSelected ? 'border-[#b599ff] bg-[#f6f2ff]' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSkill(skill.id)}
                        className="h-5 w-5 accent-[#1363ff] border-slate-300 rounded"
                      />
                      <span className={`text-sm md:text-base ${isSelected ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                        {skill.label}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}