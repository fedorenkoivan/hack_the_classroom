import { useState } from "react";
import { useNavigate } from "react-router";
import "../styles/Home.css";
import { ROLES } from "../data/skillsData";
import type { Role } from "../data/skillsData";

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const navigate = useNavigate();

  const handleStart = () => {
    if (selectedRole) {
      navigate("/quiz", {
        state: {
          roleId: selectedRole.id,
          roleLabel: selectedRole.label,
          skillSlugs: selectedRole.skillSlugs,
        },
      });
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
          Обери свою інженерну роль — отримай персональний roadmap
        </p>

        <div className="roles-grid">
          {ROLES.map((role) => (
            <button
              key={role.id}
              className={`role-card ${selectedRole?.id === role.id ? "selected" : ""}`}
              onClick={() => setSelectedRole(role)}
            >
              <span className="role-icon">{role.icon}</span>
              <span className="role-label">{role.label}</span>
              <span className="role-desc">{role.description}</span>
              <span className="role-skills">
                {role.skillSlugs.join(" · ")}
              </span>
            </button>
          ))}
        </div>

        <button
          className="analyze-button"
          onClick={handleStart}
          disabled={!selectedRole}
        >
          {selectedRole
            ? `Почати квіз для ${selectedRole.label}`
            : "Оберіть роль"}
        </button>
      </div>
    </div>
  );
}
