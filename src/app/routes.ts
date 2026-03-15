import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/quiz",
    Component: Quiz,
  },
  {
    path: "/results",
    Component: Results,
  },
]);