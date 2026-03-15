// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './routes';
// import { RouterProvider } from "react-router";
// import { router } from "./routes";
import StartPage from './pages/Home';
import QuizPage from './pages/Quiz';
import ResultsPage from './pages/Results';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.START} replace />} />
      <Route path={ROUTES.START} element={<StartPage />} />
      <Route path={ROUTES.QUIZ} element={<QuizPage />} />
      <Route path={ROUTES.RESULTS} element={<ResultsPage />} />
    </Routes>
  );
}

export default App;