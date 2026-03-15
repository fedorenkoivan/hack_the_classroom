import { useState } from "react";
import { useNavigate } from "react-router";
import { Search } from "lucide-react";
import "../styles/Home.css";

const skills = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "C++",
  "HTML/CSS",
  "SQL",
  "Git",
];

export default function Home() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const handleStart = () => {
    if (selectedSkills.length > 0) {
      navigate("/quiz", { state: { skills: selectedSkills } });
    }
  };

  return (
    <div className="home-container">
      <header className="header">SkillRoad</header>

      <div className="content">
        <h1 className="title">
          Заповни прогалини в знаннях.
          <br />
          Отримай роботу мрії.
        </h1>
        <p className="subtitle">
          Не вчи зайвого. Знай, що насправді шукає ринок
        </p>

        <div className="input-container">
          <div className="select-wrapper">
            <div className="select-trigger" onClick={() => setIsOpen(!isOpen)}>
              <Search className="search-icon" size={20} />
              <span className={selectedSkills.length === 0 ? "placeholder" : ""}>
                {selectedSkills.length === 0
                  ? "Оберіть ваші навички"
                  : selectedSkills.join(", ")}
              </span>
            </div>

            {isOpen && (
              <div className="select-dropdown">
                {skills.map((skill) => (
                  <div
                    key={skill}
                    className={`select-item ${
                      selectedSkills.includes(skill) ? "selected" : ""
                    }`}
                    onClick={() => handleSkillToggle(skill)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill)}
                      onChange={() => {}}
                      className="checkbox"
                    />
                    {skill}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            className="analyze-button"
            onClick={handleStart}
            disabled={selectedSkills.length === 0}
          >
            Аналізувати
          </button>
        </div>
      </div>
    </div>
  );
}
