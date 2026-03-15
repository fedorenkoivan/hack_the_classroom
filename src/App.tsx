// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './routes';
import StartPage from './components/StartPage';
import QuizPage from './components/QuizPage';
import ResultsPage from './components/ResultsPage';

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