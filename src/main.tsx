// src/main.tsx (Оновлений)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // Імпортуємо BrowserRouter
import App from "./app/App.tsx";
import "./styles/index.css";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Обертаємо App у BrowserRouter */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
// Вміст src/main.tsx має містити такий імпорт:
